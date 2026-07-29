import { EmptyState } from '@mantine/core';
import { RectangleEllipsisIcon } from 'lucide-react';
import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslate } from '../../translate/i18n';
import type { UIGlobType } from '../../ui/form/globs-input/ui-globs-input-add';
import { UIGlobsInputList, type UIGlobsInputListProps } from '../../ui/form/globs-input/ui-globs-input-list';
import { GlobsInputItem } from './globs-input-item';
import { GlobsInputResults } from './globs-input-results';
import { isDesktop, useDesktopMessage } from './hooks/use-desktop-message';

export type GlobsInputListProps = Partial<Omit<UseFormRegisterReturn, 'onChange'>>
    & Pick<UIGlobsInputListProps, 'labelList' | 'labelAddFile' | 'labelAddFolder'>
    & {
        name: string;
        value: string;
        onChange: (value: string) => void;
        limit: number;
    };

export const GlobsInputList: React.FC<GlobsInputListProps> = ({ labelList, labelAddFile, labelAddFolder, name, value, onChange, limit, disabled, ...rest }) => {
    const { t } = useTranslate();

    const desktopMessage = useDesktopMessage();

    const splittedValue = value.split('\n').map(value => value.trim()).filter(Boolean);

    const getTypeInfos = (type: UIGlobType) => {
        if (type === 'file')
            return {
                id: -1,
                directoryOnly: false,
                getFinalPaths: (values: string[]) => values,
            };

        if (type === 'folder')
            return {
                id: -2,
                directoryOnly: true,
                getFinalPaths: (values: string[]) => values.map(path => path.endsWith('/') ? path : path + '/'),
            };

        return {
            id: -3,
            directoryOnly: false,
            getFinalPaths: (values: string[]) => values,
        };
    };

    return <UIGlobsInputList
        labelList={labelList}
        labelAddFile={labelAddFile}
        labelAddFolder={labelAddFolder}
        onAdd={async (type, newValue) => {

            if (desktopMessage) {
                const typeInfos = getTypeInfos(type);

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

                newValue = typeInfos.getFinalPaths(response.values);
            }

            const newValues = [ ...splittedValue, ...newValue ];
            onChange(newValues.join('\n'));
        }}
        disabled={disabled}
        isDesktop={isDesktop}
        results={<GlobsInputResults
            values={splittedValue}
            limit={limit * 2}
        />}
        {...rest}
    >
        {splittedValue.map((value, i) => <GlobsInputItem key={i}
            name={`${name}-${i}`}
            value={value}
            onEdit={newValue => {
                const newValues = [ ...splittedValue ];
                newValues[ i ] = newValue;
                onChange(newValues.join('\n'));
            }}
            onRemove={() => {
                const newValues = [ ...splittedValue ];
                delete newValues[ i ];
                onChange(newValues.join('\n'));
            }}
            disabled={disabled}
            limit={limit}
        />)}

        {splittedValue.length === 0 && <EmptyState
            size='sm'
            icon={<RectangleEllipsisIcon />}
            title={t('settings.form.saves.empty')}
        />}
    </UIGlobsInputList>;
};
