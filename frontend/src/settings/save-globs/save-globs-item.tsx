import React from 'react';
import { useSettingsGetSaveGlobsResults } from '../../data/sdk/settings/settings.gen';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Container } from '../../ui/container/container';
import { Icon } from '../../ui/icon/icon';
import { TextInput } from '../../ui/input/text-input';
import { theme } from '../../ui/theme';
import { PathLine } from '../path-line';
import { isDesktop } from './hooks/use-file-explore';

export type SaveGlobsItemProps = {
    value: string;
    onEdit: (value: string) => void;
    onRemove: () => void;
    disabled?: boolean;
};

export const SaveGlobsItem: React.FC<SaveGlobsItemProps> = ({ value, onEdit, onRemove, disabled }) => {
    const { t } = useTranslate();

    const isGlob = value.includes('*');
    const isDirectory = isGlob || value.endsWith('/');
    const isFile = !isDirectory;

    const globResultsQuery = useSettingsGetSaveGlobsResults({ globs: [ value ] });

    const { isLoading } = globResultsQuery;
    const data = Array.isArray(globResultsQuery.data?.data) ? globResultsQuery.data.data : [];

    const showFiles = isDirectory || data.length !== 1;

    const hasHttpError = !globResultsQuery.isLoading && !!globResultsQuery.data && globResultsQuery.data.status >= 400;
    const hasError = !globResultsQuery.isLoading && (hasHttpError || globResultsQuery.isError || data.length > 50);
    const hasWarning = !globResultsQuery.isLoading && (hasError || data.length === 0);

    // console.log(globResultsQuery.isError, globResultsQuery.error, globResultsQuery.isLoadingError, globResultsQuery.data)

    return <Container
        style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            padding: 0,
            backgroundColor: theme.bg.light,
        }}
    >
        <details
            style={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
            }}
        >
            <summary
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                    gap: 8,
                    padding: 4,
                    paddingLeft: 8,
                    cursor: showFiles && data.length > 0 ? 'pointer' : undefined,
                }}
            >
                <Icon name={!isFile ? 'folder' : 'file-import'} solid forButton />

                <div style={{ flexGrow: 1, lineBreak: 'anywhere' }}>
                    {isDesktop
                        ? value
                        : <TextInput
                            value={value}
                            onChange={({ currentTarget }) => onEdit(currentTarget.value)}
                            style={{ width: '100%' }}
                            disabled={disabled}
                        />}
                </div>

                {(showFiles || isLoading || globResultsQuery.isError) && <div
                    style={{
                        display: 'flex',
                        gap: 4,
                        color: hasError ? theme.text.red : undefined,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {hasWarning && <Icon name='exclamation-triangle' solid forButton />}
                    {isLoading
                        ? '...'
                        : hasHttpError
                            ? 'error'
                            : t('settings.form.saves.test.title', { count: data.length })}
                </div>}

                <Button
                    bgColor={theme.bg.red}
                    onClick={onRemove}
                    disabled={disabled}
                >
                    <Icon name='trash' solid forButton />
                </Button>
            </summary>

            {showFiles && data.length > 0 && <pre style={{
                fontFamily: 'inherit',
                backgroundColor: theme.bg.panel,
                maxHeight: 200,
                overflow: 'auto',
                padding: 4,
                margin: 0,
            }}>
                {!isLoading && data.map(path => <PathLine key={path}>{path}</PathLine>)}
            </pre>}
        </details>
    </Container>;
};
