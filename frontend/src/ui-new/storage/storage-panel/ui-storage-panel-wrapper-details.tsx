import type React from 'react';
import { PopoverWithControls } from '../../interaction/focus-controls/components/popover/popover-with-controls';

type UIStoragePanelWrapperDetailsProps = {
    details: React.ReactNode;
    children: React.ReactElement;
};

export const UIStoragePanelWrapperDetails: React.FC<UIStoragePanelWrapperDetailsProps> = ({ details, children }) => {

    return <PopoverWithControls
        target={children}
        dropdown={details}
        dropdownProps={{
            p: 0,
            w: 300,
            style: { border: 'none' },
        }}
        position='right-start'
        closeOnClickOutside={false}
        transitionProps={{
            duration: 0,
        }}
    />;
};
