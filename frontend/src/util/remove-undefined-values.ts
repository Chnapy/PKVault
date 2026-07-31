export const removeUndefinedValues = <O extends Record<string, unknown>>(o: O): O => Object.fromEntries(Object.entries(o).filter(([ k, v ]) => v !== undefined)) as O;
