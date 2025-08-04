import { useStaticData } from '../static-data/static-data';

export const useAbilityByIdOrName = () => {
    const abilities = useStaticData().ability;

    return (idOrName: number | string) => abilities.find(ability => typeof idOrName === 'number' ? ability.id === idOrName : ability.name === idOrName);
};
