import React from 'react';

export type FocusScopeId = string;
export type FocusNodeId = string;

export type RestoreMode = 'last-focused' | 'first-child';

export type FocusNodeData = {
  id: FocusNodeId;
  scopeId: FocusScopeId;
  focusSelf: () => void;
};

export type FocusScopeData = {
  id: FocusScopeId;
  parentScopeId?: FocusScopeId;
  restoreMode: RestoreMode;
  lastFocusedNodeId?: FocusNodeId;
};

// scope stack, like a list of layers
export const focusScopeStackContext = React.createContext<FocusScopeId[] | null>(null);

// static functions, doesn't change over time
export const focusRefsContext = React.createContext<{
    scopesRef: React.RefObject<Map<string, FocusScopeData>>;
    nodesRef: React.RefObject<Map<string, FocusNodeData>>;
    setScopeStack: React.Dispatch<React.SetStateAction<string[]>>;
} | null>(null);
