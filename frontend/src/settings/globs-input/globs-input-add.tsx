import { css } from '@emotion/css';
import React from 'react';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { isDesktop, useDesktopMessage } from './hooks/use-desktop-message';

export type GlobsInputAddProps = {
    label: React.ReactNode;
    type: 'file' | 'folder';
    onAdd: (paths: string[]) => void;
    disabled?: boolean;
};

export const GlobsInputAdd: React.FC<GlobsInputAddProps> = ({ label, type, onAdd, disabled }) => {
    const desktopMessage = useDesktopMessage();

    const onAddFn = async () => {
        if (!desktopMessage) {
            onAdd([ './placeholder' ]);
            return;
        }

        const response = await desktopMessage.fileExplore({
            type: 'file-explore',
            id: type === 'file' ? -1 : -2,
            directoryOnly: type === 'folder',
            basePath: '',
            multiselect: false,
        });

        if (!response.values[ 0 ]) {
            return;
        }

        onAdd(type === 'folder'
            ? response.values.map(path => path.endsWith('/') ? path : path + '/')
            : response.values);
    };

    return <Button
        onClick={onAddFn}
        className={css({ flexGrow: 1 })}
        disabled={disabled}
    >
        <Icon name='plus' solid forButton />
        {!isDesktop
            ? label
            : (type === 'file'
                ? <>
                    <Icon name='file-import' solid forButton />
                    {label}
                </>
                : <>
                    <Icon name='folder' solid forButton />
                    {label}
                </>)}
    </Button>;
};
