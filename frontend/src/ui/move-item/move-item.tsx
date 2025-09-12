import type React from 'react';
import type { MoveCategory } from '../../data/sdk/model';
import { TypeItemBase } from '../type-item/type-item-base';
import { getMoveCategoryImg } from './util/get-move-category-img';

export type MoveItemProps = {
    name: string;
    type: number;
    category: MoveCategory;
    damage?: number;
};

export const MoveItem: React.FC<MoveItemProps> = ({ name, type, category, damage }) => {
    const categoryImg = getMoveCategoryImg(category);

    return <TypeItemBase
        type={type}
        name={name}
    >
        <div
            style={{
                width: 25,
                backgroundImage: `url("${categoryImg}")`,
                backgroundSize: 'cover',
                textAlign: 'center'
            }}
        >
            {damage}
        </div>
    </TypeItemBase>;
};
