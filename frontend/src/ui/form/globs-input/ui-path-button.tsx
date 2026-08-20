import { Box, Button } from '@mantine/core';
import type React from 'react';
import { WithControlsIcons, type WithControlsIconsProps } from '../../interaction/controls/icons/with-controls-icons';
import { getPathInfos } from './util/get-path-infos';

export type UIPathButtonProps = {
    value: string;
}
    & Pick<WithControlsIconsProps, 'icons'>
    & Omit<React.ComponentProps<typeof Button<'button'>>, 'value'>;

export const UIPathButton: React.FC<UIPathButtonProps> = ({ value, icons, ...btnProps }) => {
    const actionsInfos = getPathInfos(value);

    return <WithControlsIcons placement='out' icons={icons} style={{ flexGrow: 1, lineBreak: 'anywhere' }}>
        <Button
            justify='flex-start'
            size='compact-md'
            fw='normal'
            fullWidth
            leftSection={<Box display='inline-flex' c={actionsInfos.color}>
                <actionsInfos.Icon />
            </Box>}
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
