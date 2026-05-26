import { Button } from '@mantine/core';
import { FilePlusIcon, FolderPlusIcon, MinusCircleIcon } from 'lucide-react';
import React from 'react';

export type UIGlobsInputAddProps = {
    label: React.ReactNode;
    type: 'file' | 'folder' | 'exclude';
    onAdd: (paths: string[]) => Promise<void>;
    disabled?: boolean;
};

export const UIGlobsInputAdd: React.FC<UIGlobsInputAddProps> = ({ label, type, onAdd, disabled }) => {
    const getTypeInfos = () => {
        if (type === 'file')
            return {
                id: -1,
                icon: 'file-import',
                directoryOnly: false,
                placeholder: './path/to/file',
                getFinalPaths: (values: string[]) => values,
            };

        if (type === 'folder')
            return {
                id: -2,
                icon: 'folder',
                directoryOnly: true,
                placeholder: './path/to/folder',
                getFinalPaths: (values: string[]) => values.map(path => path.endsWith('/') ? path : path + '/'),
            };

        return {
            id: -3,
            icon: 'exclaimation',
            directoryOnly: false,
            placeholder: '!**/files-to-exclude',
            getFinalPaths: (values: string[]) => values,
        };
    };

    const typeInfos = getTypeInfos();

    const onAddFn = async () => {
        await onAdd([ typeInfos.placeholder ]);
    };

    return <Button
        variant='filled'
        color={type === 'exclude' ? 'red' : 'blue'}
        onClick={onAddFn}
        size='compact-sm'
        style={{ flexGrow: 1 }}
        disabled={disabled}
        leftSection={type === 'exclude'
            ? <MinusCircleIcon />
            : (type === 'folder'
                ? <FolderPlusIcon />
                : <FilePlusIcon />
            )
        }
    >
        {label}
    </Button>;
};
