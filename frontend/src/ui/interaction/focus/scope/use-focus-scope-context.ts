import React from 'react';
import { Focus } from '../provider/use-focus-context';
import { focusScopeContext } from './focus-scope-context';

export const useFocusScopeContextNullable = () => React.use(focusScopeContext);

export const useFocusScopeContext = () => {
  const context = useFocusScopeContextNullable();
  if (!context) {
    throw new Error('Component must be inside FocusProvider');
  }
  return context;
};

export const useFocusScopeSelect = () => {
  const { scopeId, parentsIds } = useFocusScopeContext();
  const { normalizeScope } = Focus.usePushPopScope();

  return React.useCallback(() => {
    const stack = [...parentsIds, scopeId];

    normalizeScope(stack);
  }, [normalizeScope, parentsIds, scopeId]);
};
