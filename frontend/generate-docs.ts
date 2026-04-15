#!/bin/node

import { prepareDocs } from './src/help/prepare-docs.ts';

const sourcePath = process.env.DOCS_PATH;
if (!sourcePath) {
    throw new Error("DOCS_PATH env variable not defined");
}

prepareDocs(sourcePath);
