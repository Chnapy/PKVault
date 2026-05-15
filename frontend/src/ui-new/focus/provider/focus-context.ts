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
  restoreMode: RestoreMode;
  lastFocusedNodeId?: FocusNodeId;
};

export type FocusDataContext = {
    scopes: Map<FocusScopeId, FocusScopeData>;
    nodes: Map<FocusNodeId, FocusNodeData>;
    scopeStackRef: React.RefObject<FocusScopeId[]>;
    setScopeStack: React.Dispatch<React.SetStateAction<FocusScopeId[]>>;
    scopeListeners: Map<FocusScopeId, Set<() => void>>;
};

// static functions, doesn't change over time
export const focusRefsContext = React.createContext<FocusDataContext | null>(null);
