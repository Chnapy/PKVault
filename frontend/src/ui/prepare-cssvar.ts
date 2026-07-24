#!/bin/node

import fs from 'node:fs';
import { baseTheme } from './base-theme.ts';

export const prepareCssvar = () => {
    console.log('- Generate css theme variables -');

    const content = `/* Generated file, for VSCode CSS Variable Autocomplete only */
    :root, :host {
    ${[
        [
            baseTheme.white && `\t--mantine-color-white: ${baseTheme.white};`,
            baseTheme.black && `\t--mantine-color-black: ${baseTheme.black};`,
        ].filter(Boolean).join('\n'),
        ...Object.entries(baseTheme.colors ?? {}).map(([key, values]) => 
            values?.map((v,i) => `\t--mantine-color-${key}-${i}: ${v};`).join('\n')
        ),
        Object.entries(baseTheme.shadows ?? {})
            .map(([key, v]) => `\t--mantine-shadow-${key}: ${v};`).join('\n'),
    ].join('\n\n')}
    }
    `;

    // console.log(content);

    fs.writeFileSync('variables.gen.css', content, 'utf8');
};
