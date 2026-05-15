import React from 'react';
import { Focus } from '../provider/use-focus-context';

export const useFocusScope = (scopeId: string, options?: {
  autoFocus?: boolean;
}) => {
  const { autoFocus } = options ?? {};

  const isScopeActive = Focus.useIsScopeActive();
  const { pushScope, popScope } = Focus.usePushPopScope();

  React.useEffect(() => {
    if (autoFocus) {
      pushScope(scopeId);
    }
  }, [autoFocus, pushScope, scopeId]);

  return {
    active: isScopeActive(scopeId),
    enterScope: () => {
      pushScope(scopeId);
    },
    exitScope: () => {
      popScope();
    },
  };
};
