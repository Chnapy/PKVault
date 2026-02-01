import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslate } from '../../translate/i18n';
import { theme } from '../../ui/theme';
import { isDesktop } from './hooks/use-desktop-message';
import { SaveGlobsAdd } from './save-globs-add';
import { SaveGlobsItem } from './save-globs-item';
import { css } from '@emotion/css';

type SaveGlobsListProps = Omit<UseFormRegisterReturn, 'onChange'> & {
    value: string;
    onChange: (value: string) => void;
};

export const SaveGlobsList: React.FC<SaveGlobsListProps> = ({ value, onChange, disabled }) => {
    const { t } = useTranslate();

    const splitedValue = value.split('\n').map(value => value.trim()).filter(Boolean);

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
            {t('settings.form.saves')}
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
                    maxHeight: 340,
                    overflow: 'auto',
                })}
            >
                {splitedValue.map((value, i) => <SaveGlobsItem key={i}
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
                        <SaveGlobsAdd
                            type='file'
                            onAdd={newValue => {
                                const newValues = [ ...splitedValue, ...newValue ];
                                onChange(newValues.join('\n'));
                            }}
                            disabled={disabled}
                        />
                        <SaveGlobsAdd
                            type='folder'
                            onAdd={newValue => {
                                const newValues = [ ...splitedValue, ...newValue ];
                                onChange(newValues.join('\n'));
                            }}
                            disabled={disabled}
                        />
                    </>
                    : <SaveGlobsAdd
                        type='file'
                        onAdd={newValue => {
                            const newValues = [ ...splitedValue, ...newValue ];
                            onChange(newValues.join('\n'));
                        }}
                        disabled={disabled}
                    />}
            </div>
        </div>
    </div>;
};
