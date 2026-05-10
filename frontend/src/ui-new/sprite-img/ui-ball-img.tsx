import type React from 'react';
import { UIItemImg, type UIItemImgProps } from './item-img/ui-item-img';

export const UIBallImg: React.FC<Omit<UIItemImgProps, 'sourceRealHeight'>> = (props) => {
    return <UIItemImg
        sourceRealHeight={19}
        {...props}
    />;
};
