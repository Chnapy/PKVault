import React from 'react';
import type { FocusScopeId } from '../provider/focus-context';

const focusScopeContext = React.createContext<FocusScopeId | null>(null);

export const FocusScopeProvider = focusScopeContext.Provider;

export const useFocusScopeContext = () => {
  const context = React.useContext(focusScopeContext);
  if (!context) {
    throw new Error('Component must be inside FocusProvider');
  }
  return context;
};
