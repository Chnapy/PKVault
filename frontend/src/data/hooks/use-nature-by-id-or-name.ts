import type { Nature } from '../sdk/model';
import { useStaticData } from '../static-data/static-data';

export const useNatureByIdOrName = () => {
    const natures = useStaticData().nature;

    return (idOrName: Nature | string) => natures.find(nature => typeof idOrName === 'number'
        // +1 due to gap between Nature & pokeapi data IDs
        ? nature.id === idOrName + 1
        : nature.name === idOrName);
};
