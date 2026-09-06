import { useMatches } from '@mantine/core';
import type React from 'react';
import { PopoverWithControls, type PopoverWithControlsProps } from '../../interaction/focus-controls/components/popover/popover-with-controls';

export type UIStoragePanelWrapperDetailsProps = Pick<PopoverWithControlsProps, 'opened' | 'setOpened' | 'position'> & {
    expanded?: boolean;
    seeThrough?: boolean;
    details: React.ReactNode;
    children: React.ReactElement;
};

const detailsWidth = 300;

export const UIStoragePanelWrapperDetails: React.FC<UIStoragePanelWrapperDetailsProps> = ({ opened, setOpened, position, expanded, seeThrough = false, details, children }) => {

    const getPageContentWidth = () => window.innerWidth - 14 * 2;

    const responsiveProps = useMatches<Pick<PopoverWithControlsProps, 'offset' | 'middlewares'>>({
        base: {
            offset: expanded ? -getPageContentWidth() : -detailsWidth,
            middlewares: { flip: false, shift: false },
        },
        sm: {},
    });

    return <PopoverWithControls
        {...responsiveProps}
        opened={opened}
        setOpened={setOpened}
        target={children}
        dropdown={details}
        width={expanded ? 'target' : detailsWidth}
        dropdownProps={{
            style: seeThrough
                ? {
                    opacity: 0.1,
                    pointerEvents: 'none',
                }
                : undefined,
        }}
        focusOnMount={false}
        position={position}
        closeOnClickOutside={false}
        transitionProps={{
            duration: 0,
        }}
    />;
};
