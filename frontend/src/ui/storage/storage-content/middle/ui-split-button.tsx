import { Stack, Tooltip } from '@mantine/core';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { UIActionIcon, type UIActionIconProps } from '../../../form/button/ui-action-icon';

type UISplitButtonProps = Pick<Tooltip.Props, 'position'>
    & Partial<UIActionIconProps>
    & {
        direction: 'left' | 'right';
    };

export const UISplitButton: React.FC<UISplitButtonProps> = ({ direction, position, ...btnProps }) => {
    const { t } = useTranslate();

    const tooltip = direction === 'left'
        ? t('storage.middle.left.description')
        : t('storage.middle.right.description');

    const icon = direction === 'left'
        ? <ChevronLeftIcon strokeWidth={3} />
        : <ChevronRightIcon strokeWidth={3} />;

    return <Tooltip label={tooltip} position={position}>
        <UIActionIcon
            name={`split-${direction}`}
            controlLabel={tooltip}
            variant='default'
            fz={10}
            size={10}
            h={160}
            bdrs={0}
            styles={{
                root: {
                    borderLeft: 'none',
                    borderRight: 'none',
                    zIndex: 1,
                },
            }}
            opacity={btnProps.disabled ? 0.5 : undefined}
            {...btnProps}
        >
            <Stack gap='xs'>
                {icon}
                {icon}
            </Stack>
        </UIActionIcon>
    </Tooltip>;
};
