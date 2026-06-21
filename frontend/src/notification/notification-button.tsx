import { Tooltip } from '@mantine/core';
import { BellIcon } from 'lucide-react';
import React from 'react';
import { BackendErrorsContext } from '../data/backend-errors-context';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { useTranslate } from '../translate/i18n';
import { UIActionIcon } from '../ui-new/form/button/ui-action-icon';
import type { PopoverContext } from '../ui-new/interaction/focus-controls/components/popover/context/popover-context';
import { PopoverWithControls } from '../ui-new/interaction/focus-controls/components/popover/popover-with-controls';
import { useCheckUpdate } from './hooks/use-check-update';
import { NotificationCardManager } from './notification-card-manager';

const useOpened = () => {
    const [ notifsCountState, setNotifsCountState ] = React.useState(0);

    const hasUpdate = !!useCheckUpdate();
    const warnings = useWarningsGetWarnings().data?.data;

    const notifsCount = BackendErrorsContext.useValue().errors.length
        + (warnings?.warningsCount ?? 0)
        + (hasUpdate ? 1 : 0);

    const opened = notifsCount !== notifsCountState;

    const ctx: PopoverContext = {
        opened,
        setOpened: React.useCallback(nextOpened => {
            if (typeof nextOpened === 'function')
                nextOpened = nextOpened(opened);

            setNotifsCountState(nextOpened
                ? 0
                : notifsCount);
        }, [ notifsCount, opened ]),
    };

    return {
        ...ctx,
        hasNotifs: notifsCount > 0,
    };
};

export const NotificationButton: React.FC = () => {
    const { t } = useTranslate();

    const { hasNotifs, opened, setOpened } = useOpened();

    return (
        <PopoverWithControls
            opened={opened}
            setOpened={setOpened}
            position='bottom-end'
            target={<Tooltip
                label={t('header.notifications.help')}
                disabled={hasNotifs}
            >
                <UIActionIcon
                    name='notif-btn'
                    controlLabel='Open notifications'
                    // variant='subtle'
                    onClick={hasNotifs
                        ? (() => setOpened(value => !value))
                        : undefined}
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
