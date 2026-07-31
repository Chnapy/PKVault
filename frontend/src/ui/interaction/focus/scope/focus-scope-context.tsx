import React from 'react';
import type { FocusScopeId } from '../provider/focus-context';

export type FocusScopeContext = {
  parentsIds: FocusScopeId[];
  scopeId: FocusScopeId;
};

export const focusScopeContext = React.createContext<FocusScopeContext | null>(null);
