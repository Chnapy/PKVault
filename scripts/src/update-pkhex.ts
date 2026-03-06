#!/bin/node
import fs from 'node:fs';
import AdmZip from 'adm-zip';
import path from 'node:path';
import { spawnSync } from 'child_process';

const releaseUrl = 'https://api.github.com/repos/kwsch/PKHeX/releases/latest';

const pkhexVersionFilepath = '../PKVault.Backend/PKHeX.version';
const pkhexOutputPath = '../PKVault.Backend';

const pkhexRepoFolder = '../tmp-pkhex';

type Release = {
    id: number;
    tag_name: string; // "26.02.27"
    draft: boolean;
    prerelease: boolean;
    tarball_url: string;
    zipball_url: string;
};

/**
 * Update PKHeX from latest release source code.
 */
const act = async () => {
    const currentTag = fs.existsSync(pkhexVersionFilepath)
        ? fs.readFileSync(pkhexVersionFilepath, 'utf8').trim()
        : '';
    console.log('Current PKHeX tag:', currentTag);

    const release = await fetch(releaseUrl).then(res => res.json() as Promise<Release>);

    console.log('Release PKHeX tag:', release.tag_name);

    if (release.tag_name === currentTag) {
        console.log('Already current tag, PKHeX update aborted.');
        return;
    }

    const sourcePath = await fetchAndExtractZipSource(release.zipball_url);

    const pkhexCorePath = path.join(sourcePath, 'PKHeX.Core');

    const commandBase = `dotnet`;
    const commandArgs = `publish ${pkhexCorePath} -o ${pkhexOutputPath}`;
    console.log();
    console.log(commandBase, commandArgs);

    const proc = spawnSync(commandBase, commandArgs.split(' '));

    console.log(`stderr: ${proc.stderr.toString()}`);
    console.log(`stdout: ${proc.stdout.toString()}`);
    console.log();

    fs.writeFileSync(pkhexVersionFilepath, release.tag_name);

    fs.rmSync(pkhexRepoFolder, { recursive: true });
};

const fetchAndExtractZipSource = async (releaseZipUrl: string) => {
    if (fs.existsSync(pkhexRepoFolder)) {
        fs.rmSync(pkhexRepoFolder, { recursive: true });
    }

    console.log('Fetching PKHeX compressed source');

    const zipFileArrayBuffer = await fetch(releaseZipUrl).then(res => res.arrayBuffer());
    const zipFileBuffer = Buffer.from(zipFileArrayBuffer);

    console.log('Unzip PKHeX source');

    const zip = new AdmZip(zipFileBuffer);
    const firstEntry = zip.getEntries()[ 0 ];

    zip.extractAllTo(pkhexRepoFolder);

    return path.join(pkhexRepoFolder, firstEntry.entryName);
};

act();
