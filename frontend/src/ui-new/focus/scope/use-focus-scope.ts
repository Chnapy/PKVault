import React from 'react';
import { Focus } from '../provider/use-focus-context';

export const useFocusScope = (scopeId: string, options?: {
  autoFocus?: boolean;
}) => {
  const { autoFocus } = options ?? {};

  const { pushScope, popScope } = Focus.usePushPopScope();

  React.useEffect(() => {
    if (autoFocus) {
      pushScope(scopeId);
    }
  }, [autoFocus, pushScope, scopeId]);

  return {
    enterScope: () => {
      pushScope(scopeId);
    },
    exitScope: () => {
      popScope();
    },
  };
};
