import { Route } from '../../routes/__root';
import docsGen from '../docs.gen';

type DocsGen = typeof docsGen[ number ];

type DocsGenEn = Extract<DocsGen, { language: 'en' }>;

type ConcatSlugs<T> = T extends {
    readonly endPath: infer P;
    readonly slugs: readonly (infer S)[];
}
    ? Extract<P, string> | `${Extract<P, string>}#${Extract<S, string>}`
    : never;

export type DocsGenEnSlugs = ConcatSlugs<DocsGenEn>;

export const useHelpNavigate = () => {
    const navigate = Route.useNavigate();

    return (helpHash: DocsGenEnSlugs | undefined) => navigate({
        search: {
            help: helpHash,
        }
    });
};
