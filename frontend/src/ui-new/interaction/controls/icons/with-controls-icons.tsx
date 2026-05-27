import { Box, type BoxProps, type ElementProps } from '@mantine/core';
import { clsx } from 'clsx';
import React from 'react';
import classes from './with-controls-icons.module.css';

type WithControlsIconsProps = BoxProps & ElementProps<'div'> & {
    placement: 'in' | 'out';
    icons: React.ReactNode;
};

export const WithControlsIcons: React.FC<WithControlsIconsProps> = ({ placement, icons, children, ...rest }) => {

    const iconList = React.Children.toArray(icons);

    return <Box {...rest} className={clsx(classes.withControlsIcons, rest.className)}>
        {children}

        {iconList.length > 0 && <Box className={clsx(classes.iconsWrapper, placement === 'out' && classes.out)}>
            {iconList.map((icon, i) => <Box key={i} className={classes.icon}>
                {icon}
            </Box>)}
        </Box>}
    </Box>;
};
