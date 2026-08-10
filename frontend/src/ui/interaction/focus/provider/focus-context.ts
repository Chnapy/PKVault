import React from 'react';
import { create } from 'zustand';

export type FocusScopeId = string;
export type FocusNodeId = string;

export type RestoreMode = 'last-focused' | 'first-child' | 'none';

export type FocusNodeData = {
  id: FocusNodeId;
  scopeId: FocusScopeId;
  order: number;
  focusSelf: () => void;
};

export type FocusScopeData = {
  id: FocusScopeId;
  restoreMode: RestoreMode;
  parentNodeId?: FocusNodeId;
  lastFocusedNodeId?: FocusNodeId;
};

export type FocusDataContext = {
  useFocusStore: ReturnType<typeof createFocusStore>;
};

export const focusRefsContext = React.createContext<FocusDataContext | null>(null);

type FocusStore = {
  scopes: Map<FocusScopeId, FocusScopeData>;
  nodes: Map<FocusNodeId, FocusNodeData>;
  scopeStack: FocusScopeId[];
};

export const createFocusStore = () => create<FocusStore>()(() => ({
  scopes: new Map(),
  nodes: new Map(),
  scopeStack: [],
}));
