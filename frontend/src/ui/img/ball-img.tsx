import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { ItemImg, type ItemImgProps } from './item-img';

export const BallImg: React.FC<Omit<Partial<ItemImgProps>, 'sourceRealHeight'>> = (props) => {
    const staticData = useStaticData();

    return <ItemImg
        sourceRealHeight={19}
        item={staticData.itemPokeball.id}
        {...props}
    />;
};
