import type { Name } from '../static-data/pokeapi/generation';

export const useCurrentLanguageName = () => {

    return (names: Name[]) => names.find(name => name.language.name === 'fr')!.name;
};
