import { useStaticData } from '../static-data/static-data';

export const useBallByIdOrName = () => {
    const items = useStaticData().item;

    return (idOrName: number | string) => items.balls.find(ball => typeof idOrName === 'number' ? ball.id === idOrName : ball.name === idOrName);
};
