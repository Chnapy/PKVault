import { Button } from '@mantine/core';
import type React from 'react';

export type UIDetailsSaveData = {
    id: string;
    label: string;
    imgSrc: string;
};

type UIDetailsSaveExpandedProps = UIDetailsSaveData & {
    selected?: boolean;
    onSelect: () => void;
};

export const UIDetailsSaveExpanded: React.FC<UIDetailsSaveExpandedProps> = ({ id, label, imgSrc, selected, onSelect }) => {

    return <Button
        variant='default'
        size='compact-md'
        leftSection={<img src={imgSrc} height={16} />}
        disabled={selected}
        onClick={onSelect}
    >
        {label}
    </Button>;
};
