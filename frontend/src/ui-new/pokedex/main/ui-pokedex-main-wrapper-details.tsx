import type React from 'react';
import { PopoverWithControls } from '../../interaction/focus-controls/components/popover/popover-with-controls';

type UIPokedexMainWrapperDetailsProps = {
    details: React.ReactNode;
    children: React.ReactElement;
};

export const UIPokedexMainWrapperDetails: React.FC<UIPokedexMainWrapperDetailsProps> = ({ details, children }) => {

    return <PopoverWithControls
        target={children}
        dropdown={details}
        dropdownProps={{
            p: 0,
            w: 300,
            style: { border: 'none' },
        }}
        position='left-start'
        closeOnClickOutside={false}
        transitionProps={{
            duration: 0,
        }}
    />;
};
