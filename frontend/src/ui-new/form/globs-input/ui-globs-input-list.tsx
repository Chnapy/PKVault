import { Accordion, Group, InputWrapper, Stack } from '@mantine/core';
import React from 'react';
import { UIGlobsInputAdd } from './ui-globs-input-add';

export type UIGlobsInputListProps = {
    labelList: React.ReactNode;
    labelAddFile: React.ReactNode;
    labelAddFolder: React.ReactNode;
    onAdd: (newValue: string[]) => Promise<void>;
    isDesktop: boolean;
    disabled?: boolean;
    results: React.ReactNode;
    children: React.ReactNode;
};

export const UIGlobsInputList: React.FC<UIGlobsInputListProps> = ({
    labelList, labelAddFile, labelAddFolder, onAdd, disabled, isDesktop, results, children
}) => {
    const addCommonProps = {
        onAdd,
        disabled,
    };

    return <Stack>
        <InputWrapper
            label={labelList}
        />

        <Accordion variant='contained'>
            {children}

            <Group my='md'>
                {isDesktop
                    ? <>
                        <UIGlobsInputAdd
                            label={labelAddFile}
                            type='file'
                            {...addCommonProps}
                        />
                        <UIGlobsInputAdd
                            label={labelAddFolder}
                            type='folder'
                            {...addCommonProps}
                        />
                        <UIGlobsInputAdd
                            label={'Add a exclude glob'}
                            type='exclude'
                            {...addCommonProps}
                        />
                    </>
                    : <>
                        <UIGlobsInputAdd
                            label={labelAddFile}
                            type='file'
                            {...addCommonProps}
                        />
                        <UIGlobsInputAdd
                            label={'Add a exclude glob'}
                            type='exclude'
                            {...addCommonProps}
                        />
                    </>}
            </Group>

            {results}
        </Accordion>
    </Stack>;
};
