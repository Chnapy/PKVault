import { css } from '@emotion/css';
import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslate } from '../../translate/i18n';
import { theme } from '../../ui/theme';
import { GlobsInputAdd } from './globs-input-add';
import { GlobsInputItem } from './globs-input-item';
import { GlobsInputResults } from './globs-input-results';
import { isDesktop } from './hooks/use-desktop-message';

export type GlobsInputListProps = Omit<UseFormRegisterReturn, 'onChange'> & {
    labelList: React.ReactNode;
    labelAddFile: React.ReactNode;
    labelAddFolder: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    limit: number;
};

export const GlobsInputList: React.FC<GlobsInputListProps> = ({ labelList, labelAddFile, labelAddFolder, value, onChange, limit, disabled }) => {
    const { t } = useTranslate();

    const splitedValue = value.split('\n').map(value => value.trim()).filter(Boolean);

    const addCommonProps = {
        onAdd: (newValue: string[]) => {
            const newValues = [ ...splitedValue, ...newValue ];
            onChange(newValues.join('\n'));
        },
        disabled,
    };

    return <div
        className={css({
            display: 'inline-flex',
            flexDirection: 'column',
            backgroundColor: theme.bg.darker,
            borderRadius: 4,
            filter: theme.shadow.filter,
            overflow: 'hidden',
            verticalAlign: 'middle',
        })}
    >
        <div
            className={css({
                padding: 4,
                cursor: 'pointer',
                color: theme.text.light,
                textShadow: theme.shadow.textlight,
            })}
        >
            {labelList}
        </div>

        <div
            className={css({
                margin: 1,
                backgroundColor: theme.bg.default,
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            })}
        >
            <div
                className={css({
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    padding: 4,
                    minHeight: 47,
                    maxHeight: 600,
                    overflow: 'auto',
                })}
            >
                {splitedValue.map((value, i) => <GlobsInputItem key={i}
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
            </div>

            <div
                className={css({
                    display: 'flex',
                    gap: 4,
                    padding: 4,
                    paddingTop: 0,
                })}
            >
                {isDesktop
                    ? <>
                        <GlobsInputAdd
                            label={labelAddFile}
                            type='file'
                            {...addCommonProps}
                        />
                        <GlobsInputAdd
                            label={labelAddFolder}
                            type='folder'
                            {...addCommonProps}
                        />
                        <GlobsInputAdd
                            label={t('settings.form.globs.add-exclude')}
                            type='exclude'
                            {...addCommonProps}
                        />
                    </>
                    : <>
                        <GlobsInputAdd
                            label={labelAddFile}
                            type='file'
                            {...addCommonProps}
                        />
                        <GlobsInputAdd
                            label={t('settings.form.globs.add-exclude')}
                            type='exclude'
                            {...addCommonProps}
                        />
                    </>}
            </div>

            <div
                className={css({
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    padding: 4,
                    paddingTop: 0,
                    maxHeight: 340,
                    overflow: 'auto',
                })}
            >
                <GlobsInputResults
                    values={splitedValue}
                    limit={limit * 2}
                />
            </div>
        </div>
    </div>;
};
