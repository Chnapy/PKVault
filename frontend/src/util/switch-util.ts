export const switchUtil = <
  K extends string | number,
  O extends Record<K, unknown>,
>(
  key: K,
  options: O
): unknown extends O[ K ] ? (O[ keyof O ] | undefined) : O[ K ] => options[ key ];

export const switchUtilRequired = <
  K extends string | number,
  O extends Record<K, unknown>,
>(
  key: K,
  options: O
): unknown extends O[ K ] ? O[ keyof O ] : O[ K ] => {
  if (!(key in options)) {
    throw new Error(`Value not found in switchUtil options: ${key}`);
  }

  return options[ key ];
};
