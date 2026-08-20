import { Button } from '@mantine/core';
import type React from 'react';
import { WithControlsIcons, type WithControlsIconsProps } from '../../interaction/controls/icons/with-controls-icons';
import { getPathIcon } from './util/get-path-icon';

export type UIPathButtonProps = {
    value: string;
}
    & Pick<WithControlsIconsProps, 'icons'>
    & Omit<React.ComponentProps<typeof Button<'button'>>, 'value'>;

export const UIPathButton: React.FC<UIPathButtonProps> = ({ value, icons, ...btnProps }) => {
    const icon = getPathIcon(value);

    return <WithControlsIcons placement='out' icons={icons} style={{ flexGrow: 1, lineBreak: 'anywhere' }}>
        <Button
            justify='flex-start'
            size='compact-md'
            fw='normal'
            fullWidth
            leftSection={icon}
            styles={{
                label: {
                    flexGrow: 1,
                },
            }}
            {...btnProps}
        >
            {value}
        </Button>
    </WithControlsIcons>;
};
