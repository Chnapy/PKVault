import { getCurrentFocusKey } from '@noriginmedia/norigin-spatial-navigation-core';
import React from 'react';
import { focusRefsContext, type FocusNodeData, type FocusNodeId, type FocusScopeData, type FocusScopeId } from './focus-context';

const useRefsContext = () => {
  const context = React.use(focusRefsContext);
  if (!context) {
    throw new Error('Component must be inside FocusProvider');
  }
  return context;
};

// register/unregister scopes and nodes
const useRegister = () => {
  const { scopes, nodes } = useRefsContext();
  const { popScope } = usePushPopScope();

  const registerScope = React.useCallback((scope: FocusScopeData) => {
    // console.log('register scope', scope.id);
    scopes.set(scope.id, scope);
  }, [ scopes ]);

  const unregisterScope = React.useCallback((scopeId: FocusScopeId) => {
    // console.log('unregister scope', scopeId);
    scopes.delete(scopeId);
  }, [ scopes ]);

  const registerNode = React.useCallback((node: FocusNodeData) => {
    // console.log('register node', node.id, node.scopeId);
    nodes.set(node.id, node);
  }, [ nodes ]);

  const unregisterNode = React.useCallback((nodeId: FocusNodeId) => {
    const node = nodes.get(nodeId);
    if (!node) return;

    const focused = getCurrentFocusKey() === nodeId;

    // console.log('unregister node', nodeId, node, focused);
    nodes.delete(nodeId);

    if (focused) {
      const scopeId = node.scopeId;

      queueMicrotask(() => {
        const nextNode = [ ...nodes.values() ].find(n => n.scopeId === scopeId);
        if (nextNode) {
          nextNode?.focusSelf();
        } else {
          popScope();
        }
      });
    }
  }, [ nodes, popScope ]);

  const setLastFocusedNode = React.useCallback((scopeId: FocusScopeId, nodeId: FocusNodeId) => {
    const scope = scopes.get(scopeId);
    if (!scope) return;

    scope.lastFocusedNodeId = nodeId;
  }, [ scopes ]);

  return {
    registerScope,
    unregisterScope,
    registerNode,
    unregisterNode,
    setLastFocusedNode,
  };
};

// handle push and pop on scope stack 
const usePushPopScope = () => {
  const { scopes, nodes, setScopeStack } = useRefsContext();
  const restoreScopeFocus = useRestoreScopeFocus();

  const pushScope = React.useCallback((scopeId: FocusScopeId) => {
    const hasScopeNodes = [ ...nodes.values() ].some(n => n.scopeId === scopeId);
    if (!hasScopeNodes)
      return;

    setScopeStack(prev => prev.at(-1) === scopeId
      ? prev
      : [
        ...prev,
        scopeId,
      ]);
    const scope = scopes.get(scopeId);
    if (scope?.lastFocusedNodeId) {
      nodes.get(scope.lastFocusedNodeId)?.focusSelf();
    } else {
      queueMicrotask(() => {
        restoreScopeFocus(scopeId);
      });
    }
  }, [ nodes, restoreScopeFocus, scopes, setScopeStack ]);

  const popScope = React.useCallback(() => {
    setScopeStack(prev => {
      if (prev.length <= 1) {
        return prev;
      }

      // const current = prev.at(-1);
      const next = prev.slice(0, -1);
      const previous = next.at(-1);

      queueMicrotask(() => {
        if (previous) {
          restoreScopeFocus(previous);
        }
      });

      return next;
    });
  }, [ restoreScopeFocus, setScopeStack ]);

  return {
    pushScope,
    popScope,
  };
};

// restore focus on saved last focused node
const useRestoreScopeFocus = () => {
  const { scopes, nodes } = useRefsContext();

  const getFirstScopeNode = React.useCallback((scopeId: FocusScopeId) => {
    return Array.from(nodes.values())
      .find(node => node.scopeId === scopeId);
  }, [ nodes ]);

  return React.useCallback((scopeId: FocusScopeId) => {
    const scope = scopes.get(scopeId);
    if (!scope) return;

    switch (scope.restoreMode) {
      case 'last-focused': {
        const lastNodeId = scope.lastFocusedNodeId;

        if (lastNodeId) {
          const node = nodes.get(lastNodeId);
          if (node) {
            node.focusSelf();
            return;
          }
        }

        getFirstScopeNode(scopeId)?.focusSelf();
        return;
      }

      case 'first-child': {
        getFirstScopeNode(scopeId)?.focusSelf();
        return;
      }
    }
  }, [ getFirstScopeNode, nodes, scopes ]);
};

const useIsScopeActive = (scopeId: FocusScopeId) => {
  const { scopeStackRef, scopeListeners } = useRefsContext();

  const active = React.useSyncExternalStore(
    (trigger) => {
      let listeners = scopeListeners.get(scopeId);
      if (!listeners) {
        listeners = new Set();
        scopeListeners.set(scopeId, listeners);
      }
      listeners.add(trigger);

      return () => {
        scopeListeners.get(scopeId)?.delete(trigger);
      };
    },
    () => scopeStackRef.current.at(-1) === scopeId,
  );

  return active;
};

export const Focus = {
  useRegister,
  usePushPopScope,
  useRestoreScopeFocus,
  useIsScopeActive,
};
