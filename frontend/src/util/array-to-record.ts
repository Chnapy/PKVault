export const arrayToRecord = <V, K extends keyof V>(arr: V[], key: K) =>
  Object.fromEntries(arr.map((value) => [value[key], value])) as Record<
    Extract<V[K], string | number>,
    V
  >;
