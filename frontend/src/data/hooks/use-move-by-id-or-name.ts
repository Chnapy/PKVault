import { useStaticData } from '../static-data/static-data';

export const useMoveByIdOrName = () => {
    const moves = useStaticData().move;

    return (idOrName: number | string) => moves.find(move => typeof idOrName === 'number' ? move.id === idOrName : move.name === idOrName);
};
