import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { TypeItemBase, type TypeItemBaseProps } from './type-item-base';
import { css } from '@emotion/css';

export type TypeItemProps = Pick<TypeItemBaseProps, 'type'>;

export const TypeItem: React.FC<TypeItemProps> = ({ type }) => {
    const { types } = useStaticData();

    return <TypeItemBase
        type={type}
        name={types[ type ]?.name ?? ''}
        className={css({
            display: 'inline-block',
            verticalAlign: 'top'
        })}
    />;
};
