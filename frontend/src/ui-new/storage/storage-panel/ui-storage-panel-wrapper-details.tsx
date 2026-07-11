import type React from 'react';
import { PopoverWithControls, type PopoverWithControlsProps } from '../../interaction/focus-controls/components/popover/popover-with-controls';

export type UIStoragePanelWrapperDetailsProps = Pick<PopoverWithControlsProps, 'opened' | 'setOpened' | 'position'> & {
    expanded?: boolean;
    seeThrough?: boolean;
    details: React.ReactNode;
    children: React.ReactElement;
};

export const UIStoragePanelWrapperDetails: React.FC<UIStoragePanelWrapperDetailsProps> = ({ opened, setOpened, position, expanded, seeThrough = false, details, children }) => {
    return <PopoverWithControls
        opened={opened}
        setOpened={setOpened}
        target={children}
        dropdown={details}
        width={expanded ? 'target' : 300}
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
