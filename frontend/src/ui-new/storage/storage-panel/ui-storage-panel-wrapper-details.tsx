import type React from 'react';
import { PopoverWithControls, type PopoverWithControlsProps } from '../../interaction/focus-controls/components/popover/popover-with-controls';

export type UIStoragePanelWrapperDetailsProps = Pick<PopoverWithControlsProps, 'opened' | 'setOpened'> & {
    seeThrough?: boolean;
    details: React.ReactNode;
    children: React.ReactElement;
};

export const UIStoragePanelWrapperDetails: React.FC<UIStoragePanelWrapperDetailsProps> = ({ opened, setOpened, seeThrough = false, details, children }) => {
    return <PopoverWithControls
        opened={opened}
        setOpened={setOpened}
        target={children}
        dropdown={details}
        dropdownProps={{
            p: 0,
            w: 300,
            style: {
                border: 'none',
                ...seeThrough
                    ? {
                        opacity: 0.1,
                        pointerEvents: 'none',
                    }
                    : {},
            },
        }}
        position='right-start'
        closeOnClickOutside={false}
        transitionProps={{
            duration: 0,
        }}
    />;
};
