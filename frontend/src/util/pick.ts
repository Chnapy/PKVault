export const pick = <O, K extends keyof O>(obj: O, keys: K[]) =>
  Object.fromEntries(keys.map((key) => [key, obj[key]])) as Pick<O, K>;
