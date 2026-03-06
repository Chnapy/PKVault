#!/bin/node
import fs from 'node:fs';
import { spawnSync } from 'child_process';
import { argv } from 'node:process';


/**
 * Add EF core migration file, edited to be compatible with PublishTrimmed.
 */
const addMigrationTrimmedCompatible = async (filename: string) => {
    console.log(`Create migration with filename=${filename}`);

    if (!filename) {
        throw new Error('no filename given');
    }

    const proc = spawnSync(
        "dotnet",
        `ef migrations add ${filename} --json`.split(' '),
        {
            cwd: '../PKVault.Backend',
        }
    );

    const error = proc.stderr.toString();
    const output = proc.stdout.toString();

    console.log(`stderr: ${error}`);
    console.log(`stdout: ${output}`);
    console.log();

    if (proc.error) {
        throw proc.error;
    }

    if (error) {
        throw new Error(error);
    }

    const jsonTxt = output.split('\n')
        .filter(line => line.trim().length > 0)
        .slice(-5)
        .join('\n');

    const json: { [ key in string ]?: string } = JSON.parse(jsonTxt);
    const migrationFilePath = json.migrationFile;
    if (!migrationFilePath) {
        throw new Error('no migrationFilePath found');
    }

    const migrationContent = fs.readFileSync(migrationFilePath, 'utf8');

    const migrationContentFixed = migrationContent.split('\n')
        .map(withName)
        .join('\n');

    fs.writeFileSync(migrationFilePath, migrationContentFixed, 'utf8');

    console.log("migrationContentFixed:", migrationContentFixed);
};

const withName = (line: string): string => {
    // Regex catching:
    // - column name ("ID" etc)
    // - parameters (type: "...", ...)
    const pattern = /^\s*(\w+)\s*=\s*table\.Column<.+>\(([^)]*)\),?\s*$/;

    const match = pattern.exec(line);

    if (!match) {
        return line;
    }

    const columnName = match[ 1 ];   // ex: "Id"
    const parameters = match[ 2 ];   // ex: "type: "...", nullable: false"

    if (
        !columnName.trim()
        || !parameters.trim()
        || parameters.includes('name:')
    ) {
        return line;
    }

    if (!parameters.includes("type:")) {
        throw new Error(`Missing 'type:' with line:\n${line}`);
    }

    return line.replace("type:", `name: "${columnName}", type:`);
}

addMigrationTrimmedCompatible(argv[ 2 ] ?? '')
