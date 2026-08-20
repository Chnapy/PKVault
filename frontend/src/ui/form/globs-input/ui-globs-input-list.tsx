import { Alert, Card, Group, InputWrapper, Stack } from '@mantine/core';
import { PenOffIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { UIGlobsInputAdd, type UIGlobsInputAddProps } from './ui-globs-input-add';

export type UIGlobsInputListProps = Pick<UIGlobsInputAddProps, 'onAdd' | 'disabled'> & {
    id: string;
    labelList: React.ReactNode;
    labelAddFile: string;
    labelAddFolder: string;
    isDesktop: boolean;
    results: React.ReactNode;
    children: React.ReactNode;
};

export const UIGlobsInputList: React.FC<UIGlobsInputListProps> = ({
    id, labelList, labelAddFile, labelAddFolder, onAdd, disabled, isDesktop, results, children
}) => {
    const { t } = useTranslate();

    const addCommonProps = {
        onAdd,
        disabled,
    };

    return <Stack id={id}>
        <InputWrapper
            label={labelList}
            description={t('settings.form.globs.help')}
        />

        {disabled && <Alert variant='outline' color='blue' icon={<PenOffIcon />}>
            {t('action.edit-not-possible')}
        </Alert>}

        <Card withBorder>
            {React.Children.map(children, (c, i) => c && <Card.Section key={i} withBorder inheritPadding py='md'>{c}</Card.Section>)}
        </Card>

        <Group my='md'>
            {isDesktop
                ? <>
                    <UIGlobsInputAdd
                        name='add-file'
                        label={labelAddFile}
                        type='file'
                        {...addCommonProps}
                    />
                    <UIGlobsInputAdd
                        name='add-folder'
                        label={labelAddFolder}
                        type='folder'
                        {...addCommonProps}
                    />
                </>
                : <>
                    <UIGlobsInputAdd
                        name='add-file-or-folder'
                        label={labelAddFile}
                        type='file-folder'
                        {...addCommonProps}
                    />
                </>}
        </Group>

        {results}
    </Stack>;
};
