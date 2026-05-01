#!/bin/node

import fs from 'fs';
import fsExtra from 'fs-extra';
import { generate, setVerbose } from 'orval';
import path from 'path';
import prettier from 'prettier';

const debug: boolean = false;
setVerbose(debug);
const debugLog = (...data: unknown[]) => debug && console.log(...data);

console.log('- SDK generation by diff start -');
console.log('- Only new or changed files will be written -');

type MemFS = Map<string, string>;

const patchFS = (memfs: MemFS) => {
  const savedFs = {
    existsSync: fs.existsSync.bind(fs),
    outputFile: fsExtra.outputFile.bind(fsExtra),
    ensureFile: fsExtra.ensureFile.bind(fsExtra),
  };

  fs.existsSync = (filePath: unknown) => {
    debugLog('existsSync', filePath);
    return memfs.has(path.resolve(String(filePath))) || savedFs.existsSync(String(filePath));
  };

  fsExtra.outputFile = async (filePath: string, data: unknown) => {
    memfs.set(path.resolve(filePath), String(data));

    if (debug) {
      const exist = savedFs.existsSync(filePath);

      debugLog('outputFile', filePath, String(data).length, {
        exist,
        equals: exist && fs.readFileSync(filePath, 'utf8') === data
      });
    }

    // saved.writeFile(filePath, data, 'utf8');  // this is what cause slowness: 132 files at once
  };

  fsExtra.ensureFile = async (filePath: string) => {
    debugLog('ensureFile', filePath);
    const abs = path.resolve(String(filePath));
    if (!memfs.has(abs)) memfs.set(abs, '');
  };

  return savedFs;
};

const passToChangedFiles = async (memfs: MemFS, memchanges: MemFS) => {
  for (const [ filepath, writeContent ] of memfs) {
    let changed = false;

    try {
      const readContent = await fsExtra.readFile(filepath, 'utf8');
      changed = readContent.trim() !== writeContent.trim();
    } catch {
      changed = true;
    }

    if (changed) {
      memchanges.set(filepath, writeContent);
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

const memchanges: MemFS = new Map();
await passToChangedFiles(memfs, memchanges);

console.log(memchanges.size, 'changed files to write');

for (const [ filepath, content ] of memchanges) {
  console.log('writing', filepath);
  await savedFs.outputFile(filepath, content, 'utf8');
}

console.log(memchanges.size, 'changed files written');
console.log('- SDK generation finished -');
