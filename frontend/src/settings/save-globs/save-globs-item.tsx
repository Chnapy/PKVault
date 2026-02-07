import React from 'react';
import { useSettingsGetSaveGlobsResults } from '../../data/sdk/settings/settings.gen';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Container } from '../../ui/container/container';
import { Icon } from '../../ui/icon/icon';
import { TextInput } from '../../ui/input/text-input';
import { theme } from '../../ui/theme';
import { PathLine } from '../path-line';
import { isDesktop, useDesktopMessage } from './hooks/use-desktop-message';
import { css } from '@emotion/css';

export type SaveGlobsItemProps = {
    value: string;
    onEdit: (value: string) => void;
    onRemove: () => void;
    disabled?: boolean;
};

export const SaveGlobsItem: React.FC<SaveGlobsItemProps> = ({ value, onEdit, onRemove, disabled }) => {
    const { t } = useTranslate();

    const desktopMessage = useDesktopMessage();

    const isGlob = value.includes('*');
    const isDirectory = isGlob || value.endsWith('/');
    const isFile = !isDirectory;

    const globResultsQuery = useSettingsGetSaveGlobsResults({ globs: [ value ] });

    const { isLoading } = globResultsQuery;
    const data = globResultsQuery.data?.data ?? [];

    const showFiles = isDirectory || data.length !== 1;

    const hasHttpError = globResultsQuery.isError;
    const hasError = !globResultsQuery.isLoading && (globResultsQuery.isError || data.length > 50);
    const hasWarning = !globResultsQuery.isLoading && (hasError || data.length === 0);

    return <Container
        className={css({
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            padding: 0,
            backgroundColor: theme.bg.light,
        })}
    >
        <details
            className={css({
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
            })}
        >
            <summary
                className={css({
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                    gap: 8,
                    padding: 4,
                    paddingLeft: 8,
                    cursor: showFiles && data.length > 0 ? 'pointer' : undefined,
                })}
            >
                <Icon name={!isFile ? 'folder' : 'file-import'} solid forButton />

                <div className={css({ flexGrow: 1, lineBreak: 'anywhere' })}>
                    {isDesktop
                        ? value
                        : <TextInput
                            value={value}
                            onChange={({ currentTarget }) => onEdit(currentTarget.value)}
                            className={css({ width: '100%' })}
                            disabled={disabled}
                        />}
                </div>

                {(showFiles || isLoading || globResultsQuery.isError) && <div
                    className={css({
                        display: 'flex',
                        gap: 4,
                        color: hasError ? theme.text.red : undefined,
                        whiteSpace: 'nowrap',
                    })}
                >
                    {hasWarning && <Icon name='exclamation-triangle' solid forButton />}
                    {isLoading
                        ? '...'
                        : hasHttpError
                            ? 'error'
                            : t('settings.form.saves.test.title', { count: data.length })}
                </div>}

                {desktopMessage && !isGlob && <Button
                    onClick={() => desktopMessage.openFile({
                        type: 'open-folder',
                        isDirectory,
                        path: value,
                    })}
                >
                    <Icon name='folder' solid forButton />
                </Button>}

                <Button
                    bgColor={theme.bg.red}
                    onClick={onRemove}
                    disabled={disabled}
                >
                    <Icon name='trash' solid forButton />
                </Button>
            </summary>

            {showFiles && data.length > 0 && <pre className={css({
                fontFamily: 'inherit',
                backgroundColor: theme.bg.panel,
                maxHeight: 200,
                overflow: 'auto',
                padding: 4,
                margin: 0,
            })}>
                {!isLoading && data.map(path => <PathLine key={path}>{path}</PathLine>)}
            </pre>}
        </details>
    </Container>;
};
