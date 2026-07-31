import { Button } from '@mantine/core';
import { CircleQuestionMarkIcon } from 'lucide-react';
import React from 'react';
import { UIButton } from '../form/button/ui-button';
import { usePopover } from '../interaction/focus-controls/components/popover/hooks/use-popover';
import { UIPopoverCard } from './popover-card/ui-popover-card';
import { UIPopover, type UIPopoverProps } from './ui-popover';
import { useTranslate } from '../../translate/i18n';

type UIConfirmPopoverProps = Pick<UIPopoverProps, 'popoverRef' | 'nested' | 'children'> & {
    label: string;
    description?: string;
    color?: Button.Props[ 'color' ];
    action?: () => unknown;
};

export const UIConfirmPopover: React.FC<UIConfirmPopoverProps> = ({ label, description, color, action, ...rest }) => {
    return <UIPopover
        dropdown={<Dropdown label={label} description={description} color={color} action={action} />}
        {...rest}
    />;
};

const Dropdown: React.FC<Pick<UIConfirmPopoverProps, 'label' | 'description' | 'color' | 'action'>> = ({ label, description, color, action }) => {
    const { t } = useTranslate();

    const popover = usePopover()!;

    return <UIPopoverCard
        icon={<CircleQuestionMarkIcon />}
        title={label}
        description={description}
    >
        <UIButton
            name='confirm_dropdown'
            controlLabel={t('action.confirm')}
            fullWidth
            variant='filled'
            color={color}
            onClick={() => {
                const result = action?.();
                if (result instanceof Promise) {
                    return result.then(() => popover.setOpened(false));
                }
                popover.setOpened(false);
            }}
        >
            Confirm ?
        </UIButton>
    </UIPopoverCard>;
};
