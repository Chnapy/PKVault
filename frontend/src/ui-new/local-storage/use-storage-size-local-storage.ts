import { useLocalStorage } from '@mantine/hooks';

export type SpriteSizeLocalStorageKey = 'storage-sprite-size' | 'pokedex-sprite-size';

export const useSpriteSizeLocalStorage = (key: SpriteSizeLocalStorageKey) => {
  return useLocalStorage<number>({
    key,
    defaultValue: 1,
    deserialize: (value = '1') => +value,
    serialize: value => value.toString(),
  });
};
