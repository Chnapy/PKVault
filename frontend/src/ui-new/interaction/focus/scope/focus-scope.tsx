import React from 'react';
import type { FocusNodeId, RestoreMode } from '../provider/focus-context';
import { Focus } from '../provider/use-focus-context';
import { FocusScopeProvider } from './focus-scope-provider';

export const FocusScope: React.FC<{
    id: string;
    parentNodeId?: FocusNodeId;
    restoreMode?: RestoreMode;
    children: React.ReactNode;
}> = ({
    id,
    parentNodeId,
    restoreMode = 'last-focused',
    children,
}) => {
        const { registerScope, unregisterScope } = Focus.useRegister();

        React.useEffect(() => {
            registerScope({
                id,
                parentNodeId,
                restoreMode,
            });

            return () => {
                unregisterScope(id);
            };
        }, [ id, restoreMode, registerScope, unregisterScope, parentNodeId ]);

        return <FocusScopeProvider scopeId={id}>
            {children}
        </FocusScopeProvider>;
    };
