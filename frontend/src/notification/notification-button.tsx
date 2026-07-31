import { Tooltip } from '@mantine/core';
import { BellIcon } from 'lucide-react';
import React from 'react';
import { BackendErrorsContext } from '../data/backend-errors-context';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { useTranslate } from '../translate/i18n';
import { UIActionIcon } from '../ui/form/button/ui-action-icon';
import type { PopoverContext } from '../ui/interaction/focus-controls/components/popover/context/popover-context';
import { PopoverWithControls } from '../ui/interaction/focus-controls/components/popover/popover-with-controls';
import { useCheckUpdate } from './hooks/use-check-update';
import { NotificationCardManager } from './notification-card-manager';

const useOpened = () => {
    const [ alertsCountState, setAlertsCountState ] = React.useState(0);

    const hasUpdate = !!useCheckUpdate();
    const warnings = useWarningsGetWarnings().data?.data;

    const alertsCount = BackendErrorsContext.useValue().errors.length
        + (warnings?.warningsCount ?? 0)
        + (hasUpdate ? 1 : 0);

    const opened = alertsCount !== alertsCountState;

    const ctx: PopoverContext = {
        opened,
        setOpened: React.useCallback(nextOpened => {
            if (typeof nextOpened === 'function')
                nextOpened = nextOpened(opened);

            setAlertsCountState(nextOpened
                ? 0
                : alertsCount);
        }, [ alertsCount, opened ]),
    };

    return {
        ...ctx,
        hasAlerts: alertsCount > 0,
    };
};

export const NotificationButton: React.FC = () => {
    const { t } = useTranslate();

    const { hasAlerts, opened, setOpened } = useOpened();

    return (
        <PopoverWithControls
            opened={opened}
            setOpened={setOpened}
            position='bottom-end'
            target={<Tooltip
                label={t('header.notifications.help')}
                disabled={hasAlerts}
            >
                <UIActionIcon
                    name='alerts-btn'
                    controlLabel={t('header.notifications.controls-label')}
                    // variant='subtle'
                    onClick={hasAlerts
                        ? (() => setOpened(value => !value))
                        : undefined}
                    disabled={!hasAlerts}
                    size='1lh'
                    lh='inherit'
                >
                    <BellIcon />
                </UIActionIcon>
            </Tooltip>}
            dropdown={<NotificationCardManager />}
            dropdownProps={{
                maw: 600,
                mah: 300,
            }}
        />
    );
};
