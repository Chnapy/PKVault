import React from 'react';
import type { FocusScopeId } from '../provider/focus-context';
import { focusScopeContext, type FocusScopeContext } from './focus-scope-context';

export const FocusScopeProvider: React.FC<{
  scopeId: FocusScopeId;
  children: React.ReactNode;
}> = ({ scopeId, children }) => {
  const parentValue = React.use(focusScopeContext);

  const value = React.useMemo((): FocusScopeContext => {
    const parentsIds = parentValue
      ? [ ...parentValue.parentsIds, parentValue.scopeId ]
      : [];

    return {
      scopeId,
      parentsIds,
    };
  }, [ parentValue, scopeId ]);

  return <focusScopeContext.Provider value={value}>
    {children}
  </focusScopeContext.Provider>
};
