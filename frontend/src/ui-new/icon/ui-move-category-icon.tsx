import type React from 'react';
import type { MoveCategory } from '../../data/sdk/model';
import { getMoveCategoryImg } from '../../ui/move-item/util/get-move-category-img';
import { UIIcon, type UIIconProps } from './ui-icon';

type UIMoveCategoryIconProps = {
    category: MoveCategory;
} & Omit<UIIconProps, 'src' | 'alt'>;

export const UIMoveCategoryIcon: React.FC<UIMoveCategoryIconProps> = ({ category, ...rest }) => {
    const src = getMoveCategoryImg(category);

    return <UIIcon
        src={src}
        alt={`move-category-${category}`}
        {...rest}
    />;
};
