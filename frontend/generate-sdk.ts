#!/bin/node

import fs from 'fs';
import { generate, setLogLevel } from 'orval';
import path from 'path';
import prettier from 'prettier';

const debug: boolean = false;
if (debug)
  setLogLevel('debug');
const debugLog = (...data: unknown[]) => debug && console.log(...data);

console.log('- SDK generation by diff start -');
console.log('- Only new or changed files will be written -');

type MemFS = Map<string, string>;

const patchFS = (memfs: MemFS) => {
  const savedFs = {
    existsSync: fs.existsSync.bind(fs),
    statSync: fs.statSync.bind(fs),
    promisesReadFile: fs.promises.readFile,
    promisesMkdir: fs.promises.mkdir,
    promisesWriteFile: fs.promises.writeFile,
  };

  fs.existsSync = (filePath: unknown) => {
    debugLog('existsSync', filePath, memfs.has(path.resolve(String(filePath))), savedFs.existsSync(String(filePath)));
    return memfs.has(path.resolve(String(filePath))) || savedFs.existsSync(String(filePath));
  };

  // @ts-expect-error signature misc
  fs.statSync = (filePath, options) => {
    debugLog('statSync', filePath, memfs.has(path.resolve(String(filePath))));

    if (memfs.has(path.resolve(String(filePath))))
      return {
        isFile: () => true,
      } as fs.Stats;

    return savedFs.statSync(filePath, options) as never;
  };

  fs.promises.readFile = async (filePath: fs.PathLike | fs.promises.FileHandle, options) => {
    if (typeof filePath !== 'string')
      throw new Error();

    return memfs.get(path.resolve(String(filePath))) as never
      || await savedFs.promisesReadFile(filePath, options);
  };

  fs.promises.writeFile = async (filePath: fs.PathLike | fs.promises.FileHandle, data: unknown) => {
    if (typeof filePath !== 'string')
      throw new Error();

    memfs.set(path.resolve(filePath), String(data));

    if (debug) {
      const exist = savedFs.existsSync(filePath);

      debugLog('writeFile', filePath, String(data).length, {
        exist,
        equals: exist && fs.readFileSync(filePath, 'utf8') === data
      });
    }

    // saved.writeFile(filePath, data, 'utf8');  // this is what cause slowness: 132 files at once
  };

  return savedFs;
};

const passToChangedFiles = async (memfs: MemFS, memChanges: MemFS) => {
  for (const [ filepath, writeContent ] of memfs) {
    let changed = false;

    try {
      const readContent = await savedFs.promisesReadFile(filepath, 'utf8');
      changed = readContent.trim() !== writeContent.trim();
    } catch {
      changed = true;
    }

    if (changed) {
      memChanges.set(filepath, writeContent);
    }
    memfs.delete(filepath);
  }
};

const memfs: MemFS = new Map();
const savedFs = patchFS(memfs);

await generate('./orval.config.ts');

// post-process
for (const [ filepath, content ] of memfs) {
  const formattedContent = await prettier.format(content, { filepath });
  memfs.set(filepath, formattedContent);
}

const memChanges: MemFS = new Map();
await passToChangedFiles(memfs, memChanges);

console.log(memChanges.size, 'changed files to write');

for (const [ filepath, content ] of memChanges) {
  console.log('writing', filepath);
  await savedFs.promisesWriteFile(filepath, content, 'utf8');
}

console.log(memChanges.size, 'changed files written');
console.log('- SDK generation finished -');
