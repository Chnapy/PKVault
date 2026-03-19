import { EntityContext } from '../sdk/model';

const prefix = 'G';

export const getEntityContextGenerationName = (context: EntityContext, withPrefix?: boolean) => {
    const key = Object.keys(EntityContext).find(k => EntityContext[ k as keyof typeof EntityContext ] === context);
    if (!key?.startsWith('Gen')) {
        return '';
    }

    return `${withPrefix ? prefix : ''}${key.slice(3)}`;
};
