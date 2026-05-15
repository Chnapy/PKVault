import { getCurrentFocusKey } from '@noriginmedia/norigin-spatial-navigation-core';
import React from 'react';
import { focusRefsContext, focusScopeStackContext, type FocusNodeData, type FocusNodeId, type FocusScopeData, type FocusScopeId } from './focus-context';

const useScopeStackContext = () => {
  const context = React.useContext(focusScopeStackContext);
  if (!context) {
    throw new Error('Component must be inside FocusProvider');
  }
  return context;
};

const useRefsContext = () => {
  const context = React.useContext(focusRefsContext);
  if (!context) {
    throw new Error('Component must be inside FocusProvider');
  }
  return context;
};

// register/unregister scopes and nodes
const useRegister = () => {
  const { scopesRef, nodesRef } = useRefsContext();
  const { popScope } = usePushPopScope();

  const registerScope = React.useCallback((scope: FocusScopeData) => {
    // console.log('register scope', scope.id);
    scopesRef.current.set(scope.id, scope);
  }, [ scopesRef ]);

  const unregisterScope = React.useCallback((scopeId: FocusScopeId) => {
    // console.log('unregister scope', scopeId);
    scopesRef.current.delete(scopeId);
  }, [ scopesRef ]);

  const registerNode = React.useCallback((node: FocusNodeData) => {
    // console.log('register node', node.id, node.scopeId);
    nodesRef.current.set(node.id, node);
  }, [ nodesRef ]);

  const unregisterNode = React.useCallback((nodeId: FocusNodeId) => {
    const node = nodesRef.current.get(nodeId);
    if (!node) return;

    const focused = getCurrentFocusKey() === nodeId;

    // console.log('unregister node', nodeId, node, focused);
    nodesRef.current.delete(nodeId);

    if (focused) {
      const scopeId = node.scopeId;
      
      queueMicrotask(() => {
        const nextNode = [...nodesRef.current.values()].find(n => n.scopeId === scopeId);
        if (nextNode) {
          console.log({nextNode})
          nextNode?.focusSelf();
        } else {
          popScope();
        }
      });
    }
  }, [nodesRef, popScope]);

  const setLastFocusedNode = React.useCallback((scopeId: FocusScopeId, nodeId: FocusNodeId) => {
    const scope = scopesRef.current.get(scopeId);
    if (!scope) return;

    scope.lastFocusedNodeId = nodeId;
  }, [ scopesRef ]);

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
  const { scopesRef, nodesRef, setScopeStack } = useRefsContext();
  const restoreScopeFocus = useRestoreScopeFocus();

  const pushScope = React.useCallback((scopeId: FocusScopeId) => {
    const hasScopeNodes = [...nodesRef.current.values()].some(n => n.scopeId === scopeId);
    if (!hasScopeNodes)
      return;

    setScopeStack(prev => [
      ...prev,
      scopeId,
    ]);
    const scope = scopesRef.current.get(scopeId);
    if (scope?.lastFocusedNodeId) {
      nodesRef.current.get(scope.lastFocusedNodeId)?.focusSelf();
    } else {
      queueMicrotask(() => {
        restoreScopeFocus(scopeId);
      });
    }
  }, [nodesRef, restoreScopeFocus, scopesRef, setScopeStack]);

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
  const { scopesRef, nodesRef } = useRefsContext();

  const getScopeNodes = React.useCallback((scopeId: FocusScopeId) => {
    return Array.from(nodesRef.current.values())
      .filter(node => node.scopeId === scopeId);
  }, [ nodesRef ]);

  return React.useCallback((scopeId: FocusScopeId) => {
    const scope = scopesRef.current.get(scopeId);
    if (!scope) return;

    switch (scope.restoreMode) {
      case 'last-focused': {
        const lastNodeId = scope.lastFocusedNodeId;

        if (lastNodeId) {
          const node = nodesRef.current.get(lastNodeId);
          if (node) {
            node.focusSelf();
            return;
          }
        }

        const nodes = getScopeNodes(scopeId);
        nodes[ 0 ]?.focusSelf();
        return;
      }

      case 'first-child': {
        const nodes = getScopeNodes(scopeId);
        nodes[ 0 ]?.focusSelf();
        return;
      }
    }
  }, [ getScopeNodes, nodesRef, scopesRef ]);
};

const useIsScopeActive = () => {
  const scopeStack = useScopeStackContext();

  return React.useCallback((scopeId: FocusScopeId) => {
    const currentScopeId = scopeStack.at(-1);
    return currentScopeId === scopeId;
  }, [ scopeStack ]);
};

export const Focus = {
  useRegister,
  usePushPopScope,
  useRestoreScopeFocus,
  useIsScopeActive,
};
