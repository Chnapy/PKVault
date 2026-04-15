import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { SpriteImg, type SpriteImgProps } from './sprite-img';
import type { GameVersion } from '../../data/sdk/model';

export type ItemImgProps = {
    item: number | string;  // value or id
    version: GameVersion;
} & Omit<SpriteImgProps, 'spriteInfos'>;

export const ItemImg: React.FC<ItemImgProps> = ({ item, version, ...imgProps }) => {
    const staticData = useStaticData();

    let staticForm = staticData.getItem(version, item);;

    if (!staticForm?.sprite) {
        console.log('UNKNOWN ITEM SPRITE -', item);
        staticForm = staticData.itemUnknown;    // gives "?" sprite
    }

    const spriteKey = staticForm.sprite;
    const spriteInfos = staticData.spritesheets.items[ spriteKey ];

    return spriteInfos && <SpriteImg
        spriteInfos={spriteInfos}
        data-itemid={item}
        {...imgProps}
    />;
};
