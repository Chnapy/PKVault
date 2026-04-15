import type React from 'react';
import { GameVersion } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { ItemImg, type ItemImgProps } from './item-img';

export const BallImg: React.FC<Omit<Partial<ItemImgProps>, 'sourceRealHeight'>> = (props) => {
    const staticData = useStaticData();

    return <ItemImg
        sourceRealHeight={19}
        version={GameVersion.Any}
        item={staticData.itemPokeball.id}
        {...props}
    />;
};
