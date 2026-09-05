import { defineConfig } from 'cspell';

export default defineConfig({
    dictionaryDefinitions: [
        {
            name: 'project-words',
            path: './project-words.txt',
            addWords: true,
        },
        {
            name: 'game-version',
            path: './src/data/sdk/model/gameVersion.gen.ts',
            addWords: true,
        },
    ],
    dictionaries: ['project-words', 'game-version'],
    ignorePaths: [
        'package.json', '**/node_modules', '**/dist/', '**/storybook-static/', '**/assets/', '**/sdk/', '**/public/', '**/tmp/',
        '*.stories.*', '*.gen.*', '*-lock.json', '*.log', '*.test.*', '**/__tests__/',
        'fr.json', 'de.json', 'es.json', 'es-419.json', 'pt-br.json', 'it.json', '**/fr/', '**/de/', '**/es/', '**/es-419/', '**/pt-br/', '**/it/',

        '/project-words.txt', 
    ],
});
