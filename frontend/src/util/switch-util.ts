export const switchUtil = <
  K extends string | number,
  O extends Record<K, unknown>,
>(
  key: K,
  options: O
) => options[key];
