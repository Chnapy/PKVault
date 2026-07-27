import { Group, Tooltip } from '@mantine/core';
import { useMatches } from '@tanstack/react-router';
import { InfoIcon, RefreshCwIcon } from 'lucide-react';
import type React from 'react';
import { useSaveInfosScan } from '../data/sdk/save-infos/save-infos.gen';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import type { DocsGenEnSlugs } from '../help/hooks/use-help-navigate';
import { NotificationButton } from '../notification/notification-button';
import { SettingsSubMenu } from '../settings/settings-sub-menu';
import { BankList } from '../storage/bank/bank-list';
import { useTranslate } from '../translate/i18n';
import { UIButton } from '../ui/form/button/ui-button';
import { UISpriteSizingButton } from '../ui/layout/header/sub-header/ui-sprite-sizing-button';
import { UIHeader } from '../ui/layout/header/ui-header';
import { UIHeaderItem } from '../ui/layout/header/ui-header-item';
import { switchUtil } from '../util/switch-util';

type RemoveFirstChar<V extends string> = V extends `${string}${infer Rest}` ? Rest : '';

export const Header: React.FC = () => {
    const matches = useMatches();

    const { t } = useTranslate();

    const settings = useSettingsGet().data?.data;
    const savesScanMutation = useSaveInfosScan();

    const value = matches
        .filter(match => match.routeId !== '__root__' && match.fullPath[ 0 ] === '/')
        .map(match => match.fullPath.slice(1) as RemoveFirstChar<typeof match.fullPath>)[ 0 ]
        ?? '';

    type HeaderValue = typeof value;

    return <UIHeader
        left={<>
            <UIHeaderItem
                id={'saves' satisfies HeaderValue}
                to={"/saves"}
                selected={value === 'saves'}
                label={t('header.saves')}
            >
                {t('header.saves')}
            </UIHeaderItem>

            <UIHeaderItem
                id={'storage' satisfies HeaderValue}
                to={"/storage"}
                selected={value === 'storage'}
                label={t('header.storage')}
            >
                {t('header.storage')}
            </UIHeaderItem>

            <UIHeaderItem
                id={'pokedex' satisfies HeaderValue}
                to={"/pokedex"}
                selected={value === 'pokedex'}
                label={t('header.dex')}
            >
                {t('header.dex')}
            </UIHeaderItem>

            <Tooltip
                multiline
                label={[
                    t('header.reload.description'),
                    !settings?.canScanSaves && t('action.not-possible'),
                ].filter(Boolean).join('\n')}
            >
                <UIButton
                    name='refresh-data'
                    controlLabel={t('header.reload.controls-label')}
                    onClick={() => savesScanMutation.mutateAsync()}
                    loading={savesScanMutation.isPending}
                    disabled={!settings?.canScanSaves}
                    leftSection={<RefreshCwIcon />}
                    size='compact-xs'
                    fz='sm'
                    fw='normal'
                    color='white'
                    variant='outline'
                    mx='auto'
                    style={{ alignSelf: 'center' }}
                >
                    {t('header.reload')}
                </UIButton>
            </Tooltip>

        </>}
        right={<>
            <UIHeaderItem
                id='help'
                search={{ help: 'README.md' satisfies DocsGenEnSlugs }}
                label={t('header.help')}
            >
                <InfoIcon style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
                {t('header.help')}
            </UIHeaderItem>

            <UIHeaderItem
                id={'settings' satisfies HeaderValue}
                to={"/settings"}
                selected={value === 'settings'}
                label={t('header.settings')}
            >
                {t('header.settings')}
            </UIHeaderItem>

            <NotificationButton />
        </>}
        sub={switchUtil(value, {
            'storage': () => <Group wrap='nowrap' align='flex-start' gap='sm' style={{ flexGrow: 1 }}>
                <BankList />
                <UISpriteSizingButton
                    localStorageKey='storage-sprite-size'
                    ml='auto'
                />
            </Group>,
            'pokedex': () => <Group wrap='nowrap' align='flex-start' gap='sm' style={{ flexGrow: 1 }}>
                <UISpriteSizingButton
                    localStorageKey='pokedex-sprite-size'
                    ml='auto'
                />
            </Group>,
            'saves': () => null,
            'settings': () => <SettingsSubMenu />,
            '': () => null,
        })()}
    />;
};
