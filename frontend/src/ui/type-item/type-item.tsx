import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { TypeItemBase, type TypeItemBaseProps } from './type-item-base';

export type TypeItemProps = Pick<TypeItemBaseProps, 'type'>;

export const TypeItem: React.FC<TypeItemProps> = ({ type }) => {
    const { types } = useStaticData();

    return <TypeItemBase
        type={type}
        name={types[ type ].name}
        style={{
            display: 'inline-block',
            verticalAlign: 'top'
        }}
    />;
};
