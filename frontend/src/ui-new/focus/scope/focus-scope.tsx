import React from 'react';
import type { FocusScopeId, RestoreMode } from '../provider/focus-context';
import { Focus } from '../provider/use-focus-context';
import { FocusScopeProvider } from './focus-scope-context';

export const FocusScope: React.FC<{
    id: string;
    parentScopeId?: FocusScopeId;
    restoreMode?: RestoreMode;
    children: React.ReactNode;
}> = ({
    id,
    parentScopeId,
    restoreMode = 'last-focused',
    children,
}) => {
        const { registerScope, unregisterScope } = Focus.useRegister();

        React.useEffect(() => {
            registerScope({
                id,
                parentScopeId,
                restoreMode,
            });

            return () => {
                unregisterScope(id);
            };
        }, [ id, parentScopeId, restoreMode, registerScope, unregisterScope ]);

        return <FocusScopeProvider value={id}>
            {children}
        </FocusScopeProvider>;
    };
