import type React from 'react';
import { PopoverWithControls, type PopoverWithControlsProps } from '../../interaction/focus-controls/components/popover/popover-with-controls';
import { useMatches } from '@mantine/core';

export type UIPokedexMainWrapperDetailsProps = Pick<PopoverWithControlsProps, 'opened' | 'setOpened'> & {
    expanded?: boolean;
    details: React.ReactNode;
    children: React.ReactElement;
};

const detailsWidth = 300;

export const UIPokedexMainWrapperDetails: React.FC<UIPokedexMainWrapperDetailsProps> = ({ opened, setOpened, expanded, details, children }) => {

    const getPageContentWidth = () => window.innerWidth - 14 * 2;

    const responsiveProps = useMatches<Pick<PopoverWithControlsProps, 'width' | 'offset' | 'middlewares'>>({
        base: {
            width: expanded ? getPageContentWidth() : detailsWidth,
            offset: expanded ? -getPageContentWidth() - 14 : -detailsWidth,
            middlewares: { flip: false, shift: false },
        },
        sm: {
            width: expanded ? 'target' : detailsWidth,
        },
    });

    return <PopoverWithControls
        {...responsiveProps}
        opened={opened}
        setOpened={setOpened}
        target={children}
        dropdown={details}
        dropdownProps={{
            left: expanded ? 16 : undefined,
        }}
        position='left-start'
        closeOnClickOutside={false}
        transitionProps={{
            duration: 0,
        }}
    />;
};
