import { Box, type BoxProps, type ElementProps } from '@mantine/core';
import { clsx } from 'clsx';
import React from 'react';
import classes from './with-controls-icons.module.css';

type PolymorphicComponentProps<T extends React.ElementType, Props = {}> = Props & {
    as?: T;
    renderRoot?: (props: Record<string, any>) => React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

type PolymorphicRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>[ 'ref' ];

type PolymorphicComponent<DefaultElement extends React.ElementType, Props = {}> = <
    T extends React.ElementType = DefaultElement,
>(
    props: PolymorphicComponentProps<T, Props> & { ref?: PolymorphicRef<T> },
) => React.ReactNode;

export type WithControlsIconsExtraProps = BoxProps & ElementProps<'div'>;

type WithControlsIconsProps = WithControlsIconsExtraProps & {
    placement: 'in' | 'out';
    icons: React.ReactNode;
};

export const WithControlsIcons: PolymorphicComponent<typeof Box, WithControlsIconsProps> = ({ as, renderRoot, placement, icons, children, ...rest }) => {

    const Component = as ?? Box;
    renderRoot ??= props => <Component {...props} />;

    const iconList = React.Children.toArray(icons);

    const props = {
        ...rest,
        className: clsx(classes.withControlsIcons, rest.className),
        children: <>
            {children}

            {iconList.length > 0 && <Box className={clsx(classes.iconsWrapper, placement === 'out' && classes.out)}>
                {iconList.map((icon, i) => <Box key={i} className={classes.icon}>
                    {icon}
                </Box>)}
            </Box>}
        </>,
    };

    return renderRoot(props);
};
