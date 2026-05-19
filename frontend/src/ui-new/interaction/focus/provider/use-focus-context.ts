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

const normalizeScopesLastFocusedNode = (
  scopeStack: FocusScopeId[],
  scopes: Map<FocusScopeId, FocusScopeData>,
) => {
  for (let i = 0; i < scopeStack.length - 1; i++) {
    const parentScope = scopes.get(scopeStack[ i ] ?? '');
    if (!parentScope) continue;

    const childScope = scopes.get(scopeStack[ i + 1 ] ?? '');
    if (!childScope?.parentNodeId) continue;

    parentScope.lastFocusedNodeId = childScope.parentNodeId;
  }
};

// register/unregister scopes and nodes
const useRegister = () => {
  const { useFocusStore } = useRefsContext();
  const { popScope } = usePushPopScope();

  const registerScope = React.useCallback((scope: FocusScopeData) => {
    // console.log('register scope', scope.id, scopeStackRef.current);
    const { scopes, scopeStack } = useFocusStore.getState();

    scopes.set(scope.id, scope);

    normalizeScopesLastFocusedNode(scopeStack, scopes);

  }, [ useFocusStore ]);

  const unregisterScope = React.useCallback((scopeId: FocusScopeId) => {
    // console.log('unregister scope', scopeId);
    const { scopes } = useFocusStore.getState();

    scopes.delete(scopeId);
  }, [ useFocusStore ]);

  const registerNode = React.useCallback((node: FocusNodeData) => {
    // console.log('register node', node.id, node.scopeId);
    const { nodes } = useFocusStore.getState();

    nodes.set(node.id, node);
  }, [ useFocusStore ]);

  const unregisterNode = React.useCallback((nodeId: FocusNodeId) => {
    const { nodes } = useFocusStore.getState();

    const node = nodes.get(nodeId);
    if (!node) return;

    const focused = getCurrentFocusKey() === nodeId;

    // console.log('unregister node', nodeId);
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
  }, [ popScope, useFocusStore ]);

  const setLastFocusedNode = React.useCallback((scopeId: FocusScopeId, nodeId: FocusNodeId) => {
    const { scopes } = useFocusStore.getState();

    const scope = scopes.get(scopeId);
    if (!scope) return;

    scope.lastFocusedNodeId = nodeId;
  }, [ useFocusStore ]);

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
  const { useFocusStore } = useRefsContext();
  const restoreScopeFocus = useRestoreScopeFocus();

  const hasScopeNodes = React.useCallback((scopeId: FocusScopeId | undefined): scopeId is FocusScopeId =>
    !!scopeId && [ ...useFocusStore.getState().nodes.values() ].some(n => n.scopeId === scopeId),
    [ useFocusStore ]);

  const focusScope = React.useCallback((scopeId: FocusScopeId) => {
    const { scopes, nodes } = useFocusStore.getState();

    const scope = scopes.get(scopeId);
    if (scope?.lastFocusedNodeId) {
      nodes.get(scope.lastFocusedNodeId)?.focusSelf();
    } else {
      queueMicrotask(() => {
        restoreScopeFocus(scopeId);
      });
    }
  }, [ restoreScopeFocus, useFocusStore ]);

  const normalizeScope = React.useCallback((stack: FocusScopeId[]) => {
    const { scopes, scopeStack } = useFocusStore.getState();

    const lastScopeId = stack[ stack.length - 1 ];
    if (!lastScopeId || scopeStack[ scopeStack.length - 1 ] === lastScopeId)
      return;

    if (scopeStack.includes(lastScopeId))
      return;

    if (!hasScopeNodes(lastScopeId))
      return;

    // const scopeIdIndex = scopeStackRef.current.lastIndexOf(lastScopeId);
    // console.log(scopeIdIndex)
    // if (scopeIdIndex >= 0) {
    //   return;
    //   // stack = stack.slice(0,scopeIdIndex + 1);
    // }

    useFocusStore.setState(s => ({
      ...s,
      scopeStack: stack,
    }));

    normalizeScopesLastFocusedNode(stack, scopes);

    focusScope(lastScopeId);
  }, [ focusScope, hasScopeNodes, useFocusStore ]);

  const pushScope = React.useCallback((scopeId: FocusScopeId) => {
    // console.log('pushScope');
    if (!hasScopeNodes(scopeId))
      return;

    useFocusStore.setState(s => s.scopeStack.at(-1) === scopeId
      ? s
      : {
        ...s,
        scopeStack: [
          ...s.scopeStack,
          scopeId,
        ],
      });

    focusScope(scopeId);
  }, [focusScope, hasScopeNodes, useFocusStore]);

  const popScope = React.useCallback(() => {
    useFocusStore.setState(s => {
      const prev = s.scopeStack;

      const getNextStack = (stack: FocusScopeId[]): FocusScopeId[] => {
        if (stack.length <= 1)
          return stack;

        const next = stack.slice(0, -1);
        const previous = next.at(-1);

        if (!hasScopeNodes(previous))
          return getNextStack(next);

        return next;
      };

      const next = getNextStack(prev);
      const previous = next.at(-1);

      queueMicrotask(() => {
        if (previous) {
          restoreScopeFocus(previous);
        }
      });

      return {
        ...s,
        scopeStack: next,
      };
    });
  }, [hasScopeNodes, restoreScopeFocus, useFocusStore]);

  return {
    normalizeScope,
    pushScope,
    popScope,
  };
};

// restore focus on saved last focused node
const useRestoreScopeFocus = () => {
  const { useFocusStore } = useRefsContext();

  const getFirstScopeNode = React.useCallback((scopeId: FocusScopeId) => {
    return Array.from(useFocusStore.getState().nodes.values())
      .find(node => node.scopeId === scopeId);
  }, [useFocusStore]);

  return React.useCallback((scopeId: FocusScopeId) => {
    const {scopes, nodes} = useFocusStore.getState();

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
  }, [getFirstScopeNode, useFocusStore]);
};

const useIsScopeActive = (scopeId: FocusScopeId) => {
  const { useFocusStore } = useRefsContext();

  return useFocusStore(s => s.scopeStack.at(-1) === scopeId);
};

const useIsInScopeStack = (scopeId: FocusScopeId | undefined) => {
  const { useFocusStore } = useRefsContext();

  return useFocusStore(s => !!scopeId && s.scopeStack.includes(scopeId));
};

export const Focus = {
  useRegister,
  usePushPopScope,
  useRestoreScopeFocus,
  useIsScopeActive,
  useIsInScopeStack,
};
