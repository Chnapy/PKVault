import { Accordion, Group, InputWrapper, Stack } from '@mantine/core';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { UIGlobsInputAdd, type UIGlobsInputAddProps } from './ui-globs-input-add';

export type UIGlobsInputListProps = Pick<UIGlobsInputAddProps, 'onAdd' | 'disabled'> & {
    labelList: React.ReactNode;
    labelAddFile: string;
    labelAddFolder: string;
    isDesktop: boolean;
    results: React.ReactNode;
    children: React.ReactNode;
};

export const UIGlobsInputList: React.FC<UIGlobsInputListProps> = ({
    labelList, labelAddFile, labelAddFolder, onAdd, disabled, isDesktop, results, children, ...rest
}) => {
    const { t } = useTranslate();

    const addCommonProps = {
        onAdd,
        disabled,
    };

    return <Stack {...rest}>
        <InputWrapper
            label={labelList}
        />

        <Accordion variant='contained'>
            {children}

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
                        <UIGlobsInputAdd
                            name='add-exclude'
                            label={t('settings.form.globs.add-exclude')}
                            type='exclude'
                            {...addCommonProps}
                        />
                    </>
                    : <>
                        <UIGlobsInputAdd
                            name='add-file'
                            label={labelAddFile}
                            type='file'
                            {...addCommonProps}
                        />
                        <UIGlobsInputAdd
                            name='add-exclude'
                            label={t('settings.form.globs.add-exclude')}
                            type='exclude'
                            {...addCommonProps}
                        />
                    </>}
            </Group>

            {results}
        </Accordion>
    </Stack>;
};
