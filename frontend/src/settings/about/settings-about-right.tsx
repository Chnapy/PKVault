import { Badge, Card, CardSection, Group, Skeleton, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { ExternalLinkIcon, ScrollTextIcon } from 'lucide-react';
import type React from "react";
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { getReleaseVersionState } from '../../notification/hooks/use-check-update';
import { useTranslate } from '../../translate/i18n';
import { UIButton } from '../../ui/form/button/ui-button';
import { UIMarkdownRenderer } from '../../ui/markdown-renderer/ui-markdown-renderer';
import { UICardSectionControl } from '../../ui/storage/storage-panel/card-section-control/ui-card-section-control';
import { renderDate } from '../../util/render-date-time';
import { switchUtil } from '../../util/switch-util';

export const SettingsAboutRight: React.FC = () => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();

    const settingsVersion = settingsQuery.data?.data.version;

    const releasesQuery = useQuery({
        queryKey: [ 'release-list' ],
        queryFn: () => fetch('https://api.github.com/repos/chnapy/PKVault/releases')
            .then<{
                url: string;
                html_url: string;
                id: number;
                name: string;
                draft: boolean;
                prerelease: boolean;
                created_at: string;
                updated_at: string;
                published_at: string;
                body: string;
            }[]>(res => res.json())
            .then(data => data.sort((r1, r2) => {
                const state = getReleaseVersionState(r1.name.substring(1), r2.name.substring(1));
                return switchUtil(state, {
                    new: -1,
                    old: 1,
                    same: 0,
                });
            })),
    });

    const isPending = [ settingsQuery, releasesQuery ].some(q => q.isPending && q.isEnabled);

    return <Card style={{ overflowY: 'scroll' }}>
        <Card.Section component={UICardSectionControl} inheritPadding withBorder py='sm'>
            <Group gap='sm'>
                <ScrollTextIcon />
                <Text size='lg'>
                    {t('settings.about.changelog.title')}
                </Text>
            </Group>
            <Text c='dimmed' lh={1.1}>
                {t('settings.about.changelog.title.sub')}
            </Text>
        </Card.Section>

        {isPending && <Skeleton h='100vh' mt='md' />}

        {!isPending && releasesQuery.data?.map(r => {
            const releaseState = getReleaseVersionState(r.name.substring(1), settingsVersion ?? '');

            return <CardSection key={r.id} withBorder inheritPadding py='inherit'
                style={{
                    outline: switchUtil(releaseState, {
                        same: '2px solid var(--mantine-color-primary-filled)',
                        new: '2px solid var(--mantine-color-blue-filled)',
                        old: undefined,
                    }),
                    outlineOffset: -2,
                }}
            >
                <Stack>
                    <Group>
                        <UIButton
                            component='a'
                            href={r.html_url}
                            target='__blank'
                            name={`release-link-${r.name}`}
                            controlLabel={t('action.open')}
                            leftSection={<ExternalLinkIcon />}
                            variant={releaseState === 'new' ? 'filled' : 'default'}
                            color='blue'
                            size='compact-md'
                        >
                            {r.name}
                        </UIButton>
                        <Badge variant='light' size='lg'>
                            {renderDate(new Date(r.published_at))}
                        </Badge>

                        {releaseState === 'same' && <Badge variant='filled' size='lg' ml='auto'>
                            Current
                        </Badge>}
                        {releaseState === 'new' && <Badge variant='filled' color='blue' size='lg' ml='auto'>
                            New
                        </Badge>}
                        {releaseState === 'old' && <Badge variant='filled' color='gray' size='lg' ml='auto'>
                            Old
                        </Badge>}
                    </Group>
                    <UIMarkdownRenderer
                        titleReduce={3}
                    >
                        {r.body
                            .replaceAll(/@(\w+)/g, (match, name) => {
                                return `[@${name}](https://github.com/${name})`;
                            })
                            .replaceAll(/(\s)(http.+)/g, (match, space: string, url: string) => {
                                let txt = '';
                                if (url.includes('/pull/')) {
                                    txt = `#${url.split('/').pop()}`;
                                } else if (url.includes('/compare/')) {
                                    txt = url.split('/').pop()!;
                                }
                                return `${space}[${txt}](${url})`;
                            })}
                    </UIMarkdownRenderer>
                </Stack>
            </CardSection>;
        })}
    </Card>;
};
