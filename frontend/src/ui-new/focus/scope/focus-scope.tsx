import React from 'react';
import type { RestoreMode } from '../provider/focus-context';
import { Focus } from '../provider/use-focus-context';
import { FocusScopeProvider } from './focus-scope-context';

export const FocusScope: React.FC<{
    id: string;
    restoreMode?: RestoreMode;
    children: React.ReactNode;
}> = ({
    id,
    restoreMode = 'last-focused',
    children,
}) => {
        const { registerScope, unregisterScope } = Focus.useRegister();

        React.useEffect(() => {
            registerScope({
                id,
                restoreMode,
            });

            return () => {
                unregisterScope(id);
            };
        }, [ id, restoreMode, registerScope, unregisterScope ]);

        return <FocusScopeProvider value={id}>
            {children}
        </FocusScopeProvider>;
    };
