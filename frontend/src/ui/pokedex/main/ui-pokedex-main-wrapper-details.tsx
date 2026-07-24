import type React from 'react';
import { PopoverWithControls, type PopoverWithControlsProps } from '../../interaction/focus-controls/components/popover/popover-with-controls';

export type UIPokedexMainWrapperDetailsProps = Pick<PopoverWithControlsProps, 'opened' | 'setOpened'> & {
    expanded?: boolean;
    details: React.ReactNode;
    children: React.ReactElement;
};

export const UIPokedexMainWrapperDetails: React.FC<UIPokedexMainWrapperDetailsProps> = ({ opened, setOpened, expanded, details, children }) => {

    return <PopoverWithControls
        opened={opened}
        setOpened={setOpened}
        target={children}
        dropdown={details}
        dropdownProps={{
            left: expanded ? 16 : undefined,
        }}
        width={expanded ? 'target' : 300}
        position='left-start'
        closeOnClickOutside={false}
        transitionProps={{
            duration: 0,
        }}
    />;
};
