import { Tooltip } from '@mantine/core';
import { useMatches } from '@tanstack/react-router';
import { InfoIcon, RefreshCwIcon } from 'lucide-react';
import type React from 'react';
import { useSaveInfosScan } from '../data/sdk/save-infos/save-infos.gen';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import type { DocsGenEnSlugs } from '../help/hooks/use-help-navigate';
import { NotificationButton } from '../notification/notification-button';
import { BankList } from '../storage/bank-list/bank-list';
import { useTranslate } from '../translate/i18n';
import { UIButton } from '../ui-new/form/button/ui-button';
import { UIHeader } from '../ui-new/layout/header/ui-header';
import { UIHeaderItem } from '../ui-new/layout/header/ui-header-item';
import { switchUtil } from '../util/switch-util';

type RemoveFirstChar<V extends string> = V extends `${string}${infer Rest}` ? Rest : '';

export const Header: React.FC = () => {
    const matches = useMatches();

    const { t } = useTranslate();

    const settings = useSettingsGet().data?.data;
    const savesScanMutation = useSaveInfosScan();

    const value = matches
        .filter(match => match.fullPath[ 0 ] === '/')
        .map(match => match.fullPath.slice(1) as RemoveFirstChar<typeof match.fullPath>)[ 0 ]
        ?? '';

    type HeaderValue = typeof value;

    return <UIHeader
        value={value}
        left={<>
            <UIHeaderItem
                id={'saves' satisfies HeaderValue}
                to={"/saves"}
            >
                {t('header.saves')}
            </UIHeaderItem>

            <UIHeaderItem
                id={'storage' satisfies HeaderValue}
                to={"/storage"}
            >
                {t('header.storage')}
            </UIHeaderItem>

            <UIHeaderItem
                id={'pokedex' satisfies HeaderValue}
                to={"/pokedex"}
            >
                {t('header.dex')}
            </UIHeaderItem>

            <Tooltip
                label={t('action.not-possible')}
                disabled={!settings?.canScanSaves}
            >
                <UIButton
                    name='refresh-data'
                    controlLabel='Refresh data'
                    onClick={() => savesScanMutation.mutateAsync()}
                    loading={savesScanMutation.isPending}
                    disabled={!settings?.canScanSaves}
                    leftSection={<RefreshCwIcon />}
                    size='compact-xs'
                    fw='normal'
                    color='white'
                    variant='outline'
                    style={{ alignSelf: 'center' }}
                >
                    {t('header.scan-saves')}
                </UIButton>
            </Tooltip>

        </>}
        right={<>
            <UIHeaderItem
                id='help'
                search={{ help: 'README.md' satisfies DocsGenEnSlugs }}
            >
                <InfoIcon style={{ verticalAlign: 'text-bottom' }} />
                {t('header.help')}
            </UIHeaderItem>

            <UIHeaderItem
                id={'settings' satisfies HeaderValue}
                to={"/settings"}
            >
                {t('header.settings')}
            </UIHeaderItem>

            <NotificationButton />
        </>}
        sub={switchUtil(value, {
            'storage': () => <BankList />,
            'pokedex': () => null,
            'saves': () => null,
            'settings': () => null,
            '': () => null,
        })()}
    />;
};
