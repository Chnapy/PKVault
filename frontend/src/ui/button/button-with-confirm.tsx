import { PopoverButton, type PopoverPanelProps } from '@headlessui/react';
import React from 'react';
import { useTranslate } from '../../translate/i18n';
import { Button, type ButtonProps } from './button';
import { ButtonWithPopover } from './button-with-popover';

export type ButtonWithConfirmProps = Omit<ButtonProps<typeof PopoverButton>, 'as' | 'componentDescriptor'>
    & Pick<PopoverPanelProps, 'anchor'>;

export const ButtonWithConfirm: React.FC<ButtonWithConfirmProps> = ({ onClick, ...btnProps }) => {
    const { t } = useTranslate();

    return <ButtonWithPopover
        {...btnProps}
        panelContent={close => <Button onClick={async (e) => {
            await onClick(e);

            close();
        }}>
            {t('action.confirm')}
        </Button>}
    />;
};
