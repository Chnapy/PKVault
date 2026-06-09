import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { UITypeItem, type UITypeItemProps } from '../../ui-new/type-item/ui-type-item';

export type TypeItemProps = Pick<UITypeItemProps, 'type'>;

export const TypeItem: React.FC<TypeItemProps> = ({ type }) => {
    const { types } = useStaticData();

    return <UITypeItem
        type={type}
        name={types[ type ]?.name ?? ''}
    />;
};
