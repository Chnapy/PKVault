import type React from 'react';
import type { MoveCategory } from '../../data/sdk/model';
import { Icon } from '../icon/icon';
import { theme } from '../theme';
import { TypeItemBase, type TypeItemBaseProps } from '../type-item/type-item-base';
import { getMoveCategoryImg } from './util/get-move-category-img';

export type MoveItemProps = TypeItemBaseProps & {
    category: MoveCategory;
    damage?: number;
    isValid?: boolean;
};

export const MoveItem: React.FC<MoveItemProps> = ({ category, damage, isValid = true, ...rest }) => {
    const categoryImg = getMoveCategoryImg(category);

    return <TypeItemBase {...rest}>
        {!isValid && <div style={{
            width: '0.8lh',
            height: '0.8lh',
            borderRadius: 99,
            color: theme.text.light,
            backgroundColor: theme.bg.yellow,
            fontSize: '70%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            flexShrink: 0
        }}>
            <Icon name='exclaimation' solid forButton />
        </div>}

        <div
            style={{
                width: 25,
                color: theme.text.default,
                backgroundImage: `url("${categoryImg}")`,
                backgroundSize: 'cover',
                textAlign: 'center',
                flexShrink: 0,
                alignSelf: 'normal',
            }}
        >
            {damage}
        </div>
    </TypeItemBase>;
};
