import { EmptyState } from '@mantine/core';
import { PackageOpenIcon } from 'lucide-react';
import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslate } from '../../translate/i18n';
import { UIGlobsInputList, type UIGlobsInputListProps } from '../../ui/form/globs-input/ui-globs-input-list';
import { getDesktopFileTypeInfos } from '../../ui/form/globs-input/util/get-desktop-file-type-infos';
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

    const id = 'globs-list-' + name;

    return <UIGlobsInputList
        id={id}
        labelList={labelList}
        labelAddFile={labelAddFile}
        labelAddFolder={labelAddFolder}
        onAdd={async (type, newValue) => {

            if (desktopMessage) {
                const typeInfos = getDesktopFileTypeInfos(type);

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

            if (!desktopMessage) {
                setTimeout(() => {
                    const el = document.getElementById(id)?.querySelector('[data-item-last]');
                    if (el)
                        (el as HTMLElement).click();
                }, 200);
            }
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
            onChange={newValue => {
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
            data-item-last={(i === splittedValue.length - 1) || undefined}
        />)}

        {splittedValue.length === 0 && <EmptyState
            size='sm'
            icon={<PackageOpenIcon />}
            title={t('settings.form.saves.empty')}
        />}
    </UIGlobsInputList>;
};
