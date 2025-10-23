import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { SpriteImg, type SpriteImgProps } from './sprite-img';

type ItemImgProps = {
    item: number;
} & Omit<SpriteImgProps, 'spriteInfos'>;

export const ItemImg: React.FC<ItemImgProps> = ({ item, ...imgProps }) => {
    const staticData = useStaticData();

    const staticForm = staticData.items[ item ];

    if (!staticForm?.sprite) {
        console.log('UNKNOWN ITEM SPRITE -', item);
        return null;
    }

    const spriteKey = staticForm.sprite;
    const spriteInfos = staticData.spritesheets.items[ spriteKey ];

    return spriteInfos && <SpriteImg
        spriteInfos={spriteInfos}
        {...imgProps}
    />;
};
