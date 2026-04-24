import { css } from '@emotion/css';
import React from 'react';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { isDesktop, useDesktopMessage } from './hooks/use-desktop-message';

export type GlobsInputAddProps = {
    label: React.ReactNode;
    type: 'file' | 'folder' | 'exclude';
    onAdd: (paths: string[]) => void;
    disabled?: boolean;
};

export const GlobsInputAdd: React.FC<GlobsInputAddProps> = ({ label, type, onAdd, disabled }) => {
    const desktopMessage = useDesktopMessage();

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
        if (type === 'exclude') {
            onAdd([ typeInfos.placeholder ]);
            return;
        }

        if (!desktopMessage) {
            onAdd([ typeInfos.placeholder ]);
            return;
        }

        const response = await desktopMessage.fileExplore({
            type: 'file-explore',
            id: typeInfos.id,
            directoryOnly: typeInfos.directoryOnly,
            basePath: '',
            multiselect: false,
        });

        if (!response.values[ 0 ]) {
            return;
        }

        onAdd(typeInfos.getFinalPaths(response.values));
    };

    return <Button
        onClick={onAddFn}
        className={css({ flexGrow: 1 })}
        disabled={disabled}
    >
        <Icon name='plus' solid forButton />
        {!isDesktop
            ? label
            : <>
                <Icon name={typeInfos.icon} solid forButton />
                {label}
            </>}
    </Button>;
};
