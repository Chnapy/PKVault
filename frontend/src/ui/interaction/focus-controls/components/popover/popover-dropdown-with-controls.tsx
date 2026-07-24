import type React from 'react';
import { withErrorCatcher } from '../../../../../error/with-error-catcher';
import { useControls } from '../../../controls/use-controls';
import type { FocusScopeId } from '../../../focus/provider/focus-context';
import { Focus } from '../../../focus/provider/use-focus-context';
import { FocusScope } from '../../../focus/scope/focus-scope';
import { useFocusScopeContext } from '../../../focus/scope/use-focus-scope-context';
import { getBackControl } from '../../common-controls/back-controls';
import { usePopover } from './hooks/use-popover';

type PopoverDropdownWithControlsProps = {
    scopeId: FocusScopeId;
    focusOnMount?: boolean;
    children: React.ReactNode;
};

export const PopoverDropdownWithControls: React.FC<PopoverDropdownWithControlsProps> = withErrorCatcher('default', ({ scopeId, focusOnMount = true, children }) => {
    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

    const isInScope = Focus.useIsInScopeStack(scopeId);

    const popover = usePopover()!;

    useControls(
        `${scopeId}_dropdown`,
        true,
        order,
        [
            getBackControl({
                label: 'Close',
                action: () => {
                    popover.setOpened(false);
                },
            }),
        ],
        {
            // enabled during dropdown mount only
            enabled: isInScope,
        }
    );

    return <FocusScope id={scopeId} focusOnMount={focusOnMount}>
        {children}
    </FocusScope>;
});
