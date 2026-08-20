import { FilePlusIcon, FolderPlusIcon } from 'lucide-react';
import React from 'react';
import { switchUtil } from '../../../util/switch-util';
import { UIButton, type UIButtonProps } from '../button/ui-button';
import type { UIGlobType } from './util/get-path-infos';

export type UIGlobsInputAddProps = Pick<UIButtonProps, 'name'> & {
    label: string;
    type: Exclude<UIGlobType, 'exclude'>;
    onAdd: (type: UIGlobType, paths: string[]) => void;
    disabled?: boolean;
};

export const UIGlobsInputAdd: React.FC<UIGlobsInputAddProps> = ({ name, label, type, onAdd, disabled }) => {
    const placeholder = switchUtil(type, {
        file: './file',
        folder: './',
        'file-folder': './file-or-folder',
    });

    const onAddFn = () => onAdd(type, [ placeholder ]);

    return <UIButton
        name={name}
        controlLabel={label}
        variant='filled'
        color={'blue'}
        onClick={onAddFn}
        size='compact-sm'
        style={{ flexGrow: 1 }}
        disabled={disabled}
        leftSection={type === 'folder'
            ? <FolderPlusIcon />
            : <FilePlusIcon />}
    >
        {label}
    </UIButton>;
};
