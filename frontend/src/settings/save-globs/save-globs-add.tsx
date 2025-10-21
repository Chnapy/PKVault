import React from 'react';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { isDesktop, useFileExplore } from './hooks/use-file-explore';

export type SaveGlobsItemProps = {
    type: 'file' | 'folder';
    onAdd: (paths: string[]) => void;
    disabled?: boolean;
};

export const SaveGlobsAdd: React.FC<SaveGlobsItemProps> = ({ type, onAdd, disabled }) => {
    const { t } = useTranslate();

    const fileExplore = useFileExplore();

    const onAddFn = async () => {
        if (!fileExplore) {
            onAdd([ './placeholder' ]);
            return;
        }

        const response = await fileExplore({
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
        style={{ flexGrow: 1 }}
        disabled={disabled}
    >
        <Icon name='plus' solid forButton />
        {!isDesktop
            ? t('settings.form.saves.add-file')
            : (type === 'file'
                ? <>
                    <Icon name='file-import' solid forButton />
                    {t('settings.form.saves.add-file')}
                </>
                : <>
                    <Icon name='folder' solid forButton />
                    {t('settings.form.saves.add-folder')}
                </>)}
    </Button>;
};
