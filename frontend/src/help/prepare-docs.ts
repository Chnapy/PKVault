import fs from "node:fs";
import GithubSlugger from 'github-slugger';

export type DocMenuItem = {
    id: string;
    path: string;
    endPath: string;
    language: string;
    title: string;
    slugs: string[];
    order: number;
};

const slugger = new GithubSlugger();

/**
 * Prepare static functional documentation for consumption in frontend
 */
export const prepareDocs = () => {
    const paths = {
        sourceDocs: '../docs/functional',
        targetDocs: './public/docs',
        indexFile: `./src/help/docs.gen.ts`
    };

    fs.rmSync(paths.targetDocs, { recursive: true });
    fs.cpSync(paths.sourceDocs, paths.targetDocs, { recursive: true });

    const menu = fs.readdirSync(paths.targetDocs, 'utf8')
        .flatMap(language => {
            // console.log('lang', language);

            const langFiles = fs.readdirSync(`./public/docs/${language}`, 'utf8').sort();
            return langFiles.map((filename, i): DocMenuItem => {
                const endPath = filename;
                const path = `/docs/${language}/${endPath}`;
                const content = fs.readFileSync(`./public${path}`, 'utf8');
                const titleLines = content.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.startsWith('#'));
                const title = titleLines
                    .find(line => line.startsWith('# '))!
                    .slice(2);
                const titleLinesSliced = titleLines
                    .map(line => {
                        while (line.startsWith('#')) {
                            line = line.slice(1);
                        }
                        return line.trim();
                    });

                const order = filename === 'README.md' ? 0 : (i + 1);

                const slugs = titleLinesSliced.map(line => slugger.slug(line));

                // console.log(slugs);

                return {
                    id: `${language}-${order}`,
                    path,
                    endPath,
                    language,
                    title,
                    slugs,
                    order,
                };
            });
        })
        .sort((a, b) => a.id < b.id ? -1 : 1);

    // console.log('MENU', menu);

    const fileContent = `export default ${JSON.stringify(menu)} as const;`;

    fs.writeFileSync(paths.indexFile, fileContent, 'utf8');
};
