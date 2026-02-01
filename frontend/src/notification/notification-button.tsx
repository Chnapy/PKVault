import { css } from '@emotion/css';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import React from 'react';
import { BackendErrorsContext } from '../data/backend-errors-context';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { useTranslate } from '../translate/i18n';
import { Button } from '../ui/button/button';
import { ButtonWithDisabledPopover, type ButtonWithDisabledPopoverProps } from '../ui/button/button-with-disabled-popover';
import { Icon } from '../ui/icon/icon';
import { useCheckUpdate } from './hooks/use-check-update';
import { NotificationCardManager } from './notification-card-manager';

export const NotificationButton: React.FC = () => {
    const { t } = useTranslate();

    const hasUpdate = !!useCheckUpdate();
    const warnings = useWarningsGetWarnings().data?.data;

    const [ openNotif, setOpenNotif ] = React.useState(false);
    const hasWarnings = !!warnings && warnings.warningsCount > 0;
    const hasErrors = BackendErrorsContext.useValue().errors.length > 0 || hasWarnings || hasUpdate;

    React.useEffect(() => {
        if (openNotif && !hasErrors) {
            setOpenNotif(false);
        }
    }, [ hasErrors, openNotif ]);

    React.useEffect(() => {
        if (hasErrors) {
            setOpenNotif(true);
        }
    }, [ hasErrors ]);

    return (
        <Popover
            className={css({
                display: 'flex',
                flexDirection: 'column'
            })}
        >
            <PopoverButton
                as={NotifButtonWithDisabledPopover}
                disabled={!hasErrors}
                showHelp={!hasErrors}
                helpTitle={t('header.notifications.help')}
                onClick={() => setOpenNotif(value => !value)}
            >
                <Icon name='bell' solid forButton />
            </PopoverButton>

            {openNotif && <PopoverPanel
                static
                anchor='bottom end'
                className={css({ zIndex: 30 })}
            >
                <NotificationCardManager />
            </PopoverPanel>}
        </Popover>
    );
};

const NotifButtonWithDisabledPopover = (props: ButtonWithDisabledPopoverProps<typeof Button>) =>
    <ButtonWithDisabledPopover as={Button} {...props} />;
