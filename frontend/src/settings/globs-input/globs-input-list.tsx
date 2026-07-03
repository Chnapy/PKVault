import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { UIGlobsInputList, type UIGlobsInputListProps } from '../../ui-new/form/globs-input/ui-globs-input-list';
import { GlobsInputItem } from './globs-input-item';
import { GlobsInputResults } from './globs-input-results';
import { isDesktop } from './hooks/use-desktop-message';

export type GlobsInputListProps = Omit<UseFormRegisterReturn, 'onChange'>
    & Pick<UIGlobsInputListProps, 'labelList' | 'labelAddFile' | 'labelAddFolder'>
    & {
        name: string;
        value: string;
        onChange: (value: string) => void;
        limit: number;
    };

export const GlobsInputList: React.FC<GlobsInputListProps> = ({ labelList, labelAddFile, labelAddFolder, name, value, onChange, limit, disabled, ...rest }) => {
    const splitedValue = value.split('\n').map(value => value.trim()).filter(Boolean);

    return <UIGlobsInputList
        labelList={labelList}
        labelAddFile={labelAddFile}
        labelAddFolder={labelAddFolder}
        onAdd={(newValue: string[]) => {
            const newValues = [ ...splitedValue, ...newValue ];
            onChange(newValues.join('\n'));
        }}
        disabled={disabled}
        isDesktop={isDesktop}
        results={<GlobsInputResults
            values={splitedValue}
            limit={limit * 2}
        />}
        {...rest}
    >
        {splitedValue.map((value, i) => <GlobsInputItem key={i}
            name={`${name}-${i}`}
            value={value}
            onEdit={newValue => {
                const newValues = [ ...splitedValue ];
                newValues[ i ] = newValue;
                onChange(newValues.join('\n'));
            }}
            onRemove={() => {
                const newValues = [ ...splitedValue ];
                delete newValues[ i ];
                onChange(newValues.join('\n'));
            }}
            disabled={disabled}
            limit={limit}
        />)}
    </UIGlobsInputList>;
};
