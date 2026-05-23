import type React from 'react';
import { useControls } from '../../../controls/use-controls';
import type { FocusScopeId } from '../../../focus/provider/focus-context';
import { FocusScope } from '../../../focus/scope/focus-scope';
import { useFocusScopeContext } from '../../../focus/scope/use-focus-scope-context';
import { getBackControl } from '../../common-controls/back-controls';
import { usePopover } from './hooks/use-popover';

type PopoverDropdownWithControlsProps = {
    scopeId: FocusScopeId;
    children: React.ReactNode;
};

export const PopoverDropdownWithControls: React.FC<PopoverDropdownWithControlsProps> = ({ scopeId, children }) => {
    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

    const setPopover = usePopover();

    useControls(
        `${scopeId}_dropdown`,
        true,
        order,
        [
            getBackControl({
                label: 'Close',
                action: () => {
                    setPopover!(() => ({
                        opened: false,
                    }));
                },
            }),
        ],
        {
            // enabled during dropdown mount only
            enabled: true,
        }
    );

    return <FocusScope id={scopeId}>
        {children}
    </FocusScope>;
};
