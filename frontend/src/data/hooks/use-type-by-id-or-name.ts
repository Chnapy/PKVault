import { useStaticData } from '../static-data/static-data';

export const useTypeByIdOrName = () => {
    const types = useStaticData().type;

    return (idOrName: number | string) => types.find(type => typeof idOrName === 'number' ? type.id === idOrName : type.name === idOrName)!;
};
