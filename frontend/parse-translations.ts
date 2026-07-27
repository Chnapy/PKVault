import { checkTranslations, checkUndefinedKeys, checkUnusedKeys } from '@lingual/i18n-check';
import { CheckOptions, formatCheckResultTable, formatInvalidTranslationsResultTable } from '@lingual/i18n-check/dist/errorReporters.js';
import type { CheckResult, Options, TranslationFile } from '@lingual/i18n-check/dist/types';
import { flattenTranslations } from '@lingual/i18n-check/dist/utils/flattenTranslations.js';
import { glob } from 'glob';
import fs from 'node:fs';
import { resources } from './src/translate/i18n.ts';

// npx @lingual/i18n-check -s en -l src/translate/locales -f i18next -u src/
// - check missing keys in other languages files
// - check invalid variable interpolation
// - unused keys (for given -s)

const fixMode = process.argv.includes('--fix');

const placeholderValue = 'TBD';

const resourceFiles = Object.entries(resources).map(([ name, data ]) => ({
    name: name as keyof typeof resources,
    filepath: `src/translate/locales/${name}.json`,
    data: Object.fromEntries(Object.entries(data.ns)
        .filter(([key, value]) => value !== placeholderValue)
    ),
}));

const hasKeys = (checkResult: Record<string, unknown[]>) => {
    for (const [ _, keys ] of Object.entries(checkResult)) {
        if (keys.length > 0) {
            return true;
        }
    }
    return false;
};

type Results = Partial<ReturnType<typeof checkTranslations>> & {
    success: boolean;
    unusedKeyResult?: CheckResult;
    fixedUsedKeyResult: Set<string>;
    undefinedKeyResult?: CheckResult;
    literalTemplateUsages: CheckResult;
};

const main = async (): Promise<Results> => {
    const unusedSrcPath = [ 'src/' ];

    const options: Options = {
        checks: CheckOptions,
        format: 'i18next',
    };

    const srcFiles = resourceFiles.map(({ name, data }): TranslationFile => {
        return {
            reference: null,
            name,
            content: flattenTranslations(data),
        };
    });

    const targetFiles = srcFiles.flatMap(({ name }): TranslationFile[] => {
        const reference = name;
        return srcFiles.map(({ name, content }) => ({
            reference,
            name,
            content,
        }));
    });

    const result = checkTranslations(srcFiles, targetFiles, options);

    const isMultiUnusedFolders = unusedSrcPath.length > 1;
    const pattern = isMultiUnusedFolders
        ? `{${unusedSrcPath.join(',').trim()}}/**/*.{js,jsx,ts,tsx}`
        : `${unusedSrcPath.join(',').trim()}/**/*.{js,jsx,ts,tsx}`;
    const filesToParse = glob.globSync(pattern, {
        ignore: [ 'node_modules/**' ],
        windowsPathsNoEscape: true,
    });

    const filesWithContent = filesToParse.map(filepath => ({
        filepath,
        content: fs.readFileSync(filepath, 'utf8'),
    }));

    const literalTemplateRegex = /t\(\s*`.+\${.+}.*`\s*\)/gm;
    const literalTemplateUsages: CheckResult = Object.fromEntries(filesWithContent.flatMap(({ filepath, content }) => {
        const results = literalTemplateRegex.exec(content);
        if (!results)
            return [];

        return [ [
            filepath,
            [ ...results ],
        ] ];
    }));

    const unusedKeyResult = await checkUnusedKeys(srcFiles, filesToParse, options);

    const fixedUsedKeyResult = new Set(filesWithContent.flatMap(({ filepath, content }) => {
        return Object.keys(unusedKeyResult ?? {}).flatMap((key) => {
            return unusedKeyResult?.[ key as keyof typeof unusedKeyResult ].filter(unusedKey =>
                content.includes(`'${unusedKey}'`) || content.includes(`"${unusedKey}"`) || content.includes(`\`${unusedKey}\``)
            ) ?? [];
        }) ?? [];
    }));

    const undefinedKeyResult = await checkUndefinedKeys(srcFiles, filesToParse, options);

    const hasError = (result.missingKeys && Object.keys(result.missingKeys).length > 0) ||
        (result.invalidKeys && Object.keys(result.invalidKeys).length > 0) ||
        (unusedKeyResult && hasKeys(unusedKeyResult)) ||
        (undefinedKeyResult && hasKeys(undefinedKeyResult));

    return {
        success: !hasError,
        ...result,
        unusedKeyResult,
        fixedUsedKeyResult,
        undefinedKeyResult,
        literalTemplateUsages,
    };
};

const results = await main();

const { success, invalidKeys, missingKeys, unusedKeyResult, fixedUsedKeyResult, undefinedKeyResult, literalTemplateUsages } = results;

if (hasKeys(literalTemplateUsages)) {
    console.log('Literal template usages are denied');
    console.log(formatCheckResultTable(literalTemplateUsages));
    process.exit(1);
}

const cleanedUnusedKeyResult: typeof unusedKeyResult = unusedKeyResult && Object.fromEntries(Object.keys(unusedKeyResult).map(name => {
    return [
        name,
        unusedKeyResult[ name ].filter(key => !fixedUsedKeyResult.has(key)),
    ];
}));

if (missingKeys && hasKeys(missingKeys)) {
    console.log('Missing keys');
    console.log(formatCheckResultTable(missingKeys));
}

if (invalidKeys && hasKeys(invalidKeys)) {
    console.log('Invalid keys');
    console.log(formatInvalidTranslationsResultTable(invalidKeys));
}

if (cleanedUnusedKeyResult && hasKeys(cleanedUnusedKeyResult)) {
    console.log('Unused keys');
    console.log(formatCheckResultTable(cleanedUnusedKeyResult));
}

if (undefinedKeyResult && hasKeys(undefinedKeyResult)) {
    console.log('Undefined keys');
    console.log(formatCheckResultTable(undefinedKeyResult));
}

if (fixMode) {
    resourceFiles.forEach(({ name, filepath, data }) => {
        const newData = {...data};

        const unusedResults = cleanedUnusedKeyResult?.[ name ] ?? [];
        unusedResults.forEach(key => {
            delete newData[ key as keyof typeof newData ];
        });

        const missingResults = missingKeys?.[name] ?? [];
        missingResults.forEach(key => {
            newData[ key as keyof typeof newData ] = placeholderValue;
        });
        
        const sortedData = Object.fromEntries(Object.keys(newData).sort().map(key => [key, newData[key as keyof typeof newData]]));

        fs.writeFileSync(filepath, JSON.stringify(sortedData, undefined, 2));
    });

    console.log('Fix mode: translation files updated if required.');
}

if (!success)
    process.exit(1);
