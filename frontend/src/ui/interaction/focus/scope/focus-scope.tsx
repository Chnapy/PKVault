import React from 'react';
import type { FocusNodeId, RestoreMode } from '../provider/focus-context';
import { Focus } from '../provider/use-focus-context';
import { FocusScopeProvider } from './focus-scope-provider';

export const FocusScope: React.FC<{
    id: string;
    parentNodeId?: FocusNodeId;
    restoreMode?: RestoreMode;
    focusOnMount?: boolean;
    children: React.ReactNode;
}> = ({
    id,
    parentNodeId,
    restoreMode = 'last-focused',
    focusOnMount = false,
    children,
}) => {
        const { registerScope, unregisterScope } = Focus.useRegister();
        const { pushScope } = Focus.usePushPopScope();

        React.useEffect(() => {
            registerScope({
                id,
                parentNodeId,
                restoreMode,
            });

            if (focusOnMount)
                pushScope(id);

            return () => {
                unregisterScope(id);
            };
        }, [ id, restoreMode, registerScope, unregisterScope, parentNodeId, focusOnMount, pushScope ]);

        return <FocusScopeProvider scopeId={id}>
            {children}
        </FocusScopeProvider>;
    };
