import { useFocusable } from '@noriginmedia/norigin-spatial-navigation-react';
import React from 'react';
import type { FocusNodeId } from '../provider/focus-context';
import { Focus } from '../provider/use-focus-context';
import { useFocusScopeContext, useFocusScopeSelect } from '../scope/use-focus-scope-context';

export type UseFocusNodeParams = {
  scopeNodeId: FocusNodeId;
  focusOnMount?: boolean;
};

export const useFocusNode = <E extends HTMLElement>({ scopeNodeId, focusOnMount }: UseFocusNodeParams) => {
  const { scopeId } = useFocusScopeContext();
  const selectScope = useFocusScopeSelect();

  const active = Focus.useIsScopeActive(scopeId);
  const { registerNode, unregisterNode, setLastFocusedNode } = Focus.useRegister();

  // nodeId prefixed by scopeId to avoid conflicts
  const nodeId = `${scopeId}_${scopeNodeId}`;

  const { ref, focused, focusSelf } = useFocusable<unknown, E>({
    focusKey: nodeId,
    focusable: active,
    saveLastFocusedChild: false,
    trackChildren: false,
    isFocusBoundary: false,
    preferredChildFocusKey: undefined,
    // onFocus: () => console.log('focused', nodeId),
  });

  React.useEffect(() => {
    registerNode({
      id: nodeId,
      scopeId,
      focusSelf,
    });

    return () => {
      unregisterNode(nodeId);
    };
  }, [ nodeId, scopeId, focusSelf, registerNode, unregisterNode ]);

  React.useEffect(() => {
    if (focused) {
      setLastFocusedNode(scopeId, nodeId);

      selectScope();
    }
  }, [focused, nodeId, scopeId, selectScope, setLastFocusedNode]);

  React.useEffect(() => {
    if (focusOnMount) {
      focusSelf();
    }
  }, [ focusOnMount, focusSelf ]);

  const focusProps = {
    'data-focus-key': nodeId,
    'data-focus-active': active || undefined,
  };

  return {
    ref,
    nodeId,
    scopeId,
    focused,
    active,
    focusSelf,
    focusProps,
  };
};
