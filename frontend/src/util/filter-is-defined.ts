
export const filterIsDefined = <I>(item: I): item is NonNullable<I> => item !== undefined && item !== null;
