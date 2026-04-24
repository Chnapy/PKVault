import React from 'react';
import { useSettingsGetSaveGlobsResults } from '../../data/sdk/settings/settings.gen';
import { useTranslate } from '../../translate/i18n';
import { Container } from '../../ui/container/container';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { PathLine } from '../path-line';
import { css } from '@emotion/css';

export type GlobsInputResultsProps = {
    values: string[];
    limit: number;
};

export const GlobsInputResults: React.FC<GlobsInputResultsProps> = ({ values, limit }) => {
    const { t } = useTranslate();

    const globResultsQuery = useSettingsGetSaveGlobsResults({ globs: values, limit });

    const { isLoading } = globResultsQuery;
    const data = globResultsQuery.data?.data ?? [];

    const showFiles = data.length > 0;

    const hasHttpError = globResultsQuery.isError;
    const hasError = !globResultsQuery.isLoading && globResultsQuery.isError;

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
                    padding: '4px 8px',
                    // paddingLeft: 8,
                    cursor: showFiles && data.length > 0 ? 'pointer' : undefined,
                })}
            >
                <Icon name='bullet-list' forButton />

                <div className={css({ flexGrow: 1, lineBreak: 'anywhere' })}>
                    {t('settings.form.globs.results')}
                </div>

                <div
                    className={css({
                        display: 'flex',
                        gap: 4,
                        color: hasError ? theme.text.red : undefined,
                        whiteSpace: 'nowrap',
                    })}
                >
                    {hasError && <Icon name='exclamation-triangle' solid forButton />}
                    {isLoading
                        ? '...'
                        : hasHttpError
                            ? 'error'
                            : t('settings.form.saves.test.title', { count: data.length })}
                </div>
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
