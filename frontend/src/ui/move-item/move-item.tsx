import type React from 'react';
import type { MoveCategory } from '../../data/sdk/model';
import { theme } from '../theme';
import { TypeItemBase, type TypeItemBaseProps } from '../type-item/type-item-base';
import { getMoveCategoryImg } from './util/get-move-category-img';

export type MoveItemProps = TypeItemBaseProps & {
    category: MoveCategory;
    damage?: number;
};

export const MoveItem: React.FC<MoveItemProps> = ({ category, damage, ...rest }) => {
    const categoryImg = getMoveCategoryImg(category);

    return <TypeItemBase {...rest}>
        <div
            style={{
                width: 25,
                color: theme.text.default,
                backgroundImage: `url("${categoryImg}")`,
                backgroundSize: 'cover',
                textAlign: 'center',
                flexShrink: 0,
            }}
        >
            {damage}
        </div>
    </TypeItemBase>;
};
