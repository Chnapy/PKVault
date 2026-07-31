import { FilePlusIcon, FolderPlusIcon, MinusCircleIcon } from 'lucide-react';
import React from 'react';
import { switchUtil } from '../../../util/switch-util';
import { UIButton, type UIButtonProps } from '../button/ui-button';

export type UIGlobType = 'file' | 'folder' | 'exclude';

export type UIGlobsInputAddProps = Pick<UIButtonProps, 'name'> & {
    label: string;
    type: UIGlobType;
    onAdd: (type: UIGlobType, paths: string[]) => void;
    disabled?: boolean;
};

export const UIGlobsInputAdd: React.FC<UIGlobsInputAddProps> = ({ name, label, type, onAdd, disabled }) => {
    const placeholder = switchUtil(type, {
        file: './path/to/file',
        folder: './path/to/folder',
        exclude: '!**/files-to-exclude',
    });

    const onAddFn = () => onAdd(type, [ placeholder ]);

    return <UIButton
        name={name}
        controlLabel={label}
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
    </UIButton>;
};
