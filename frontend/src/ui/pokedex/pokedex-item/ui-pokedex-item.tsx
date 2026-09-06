import React from 'react';
import { UIPokedexItemRaw, type UIPokedexItemRawProps } from './ui-pokedex-item-raw';

export type UIPokedexItemProps = Omit<UIPokedexItemRawProps, 'ref'>;

export const UIPokedexItem: React.FC<UIPokedexItemProps> = props => {
    return <UIPokedexItemRaw {...props} />;
};
