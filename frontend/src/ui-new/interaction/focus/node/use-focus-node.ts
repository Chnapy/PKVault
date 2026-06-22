import { useFocusable, type UseFocusableConfig } from '@noriginmedia/norigin-spatial-navigation-react';
import React from 'react';
import type { FocusNodeId } from '../provider/focus-context';
import { Focus } from '../provider/use-focus-context';
import { useFocusScopeContext, useFocusScopeSelect } from '../scope/use-focus-scope-context';

export type UseFocusNodeParams = Pick<UseFocusableConfig<unknown>, 'onFocus'> & {
  scopeNodeId: FocusNodeId;
  focusOnMount?: boolean;
  order?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useFocusNode = <E = any>({ scopeNodeId, focusOnMount, order = 0, onFocus }: UseFocusNodeParams) => {
  const { scopeId } = useFocusScopeContext();
  const selectScope = useFocusScopeSelect();

  // TODO trigger lot of rerenders
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
    onFocus: (layout, props, details) => {
      if (!(layout.node instanceof HTMLInputElement) || layout.node.type !== 'text')
        layout.node.focus();

      onFocus?.(layout, props, details);
    },
  });

  React.useEffect(() => {
    registerNode({
      id: nodeId,
      scopeId,
      order,
      focusSelf,
    });

    return () => {
      unregisterNode(nodeId);
    };
  }, [ nodeId, scopeId, order, focusSelf, registerNode, unregisterNode ]);

  React.useEffect(() => {
    if (focused) {
      setLastFocusedNode(scopeId, nodeId);

      selectScope();
    }
  }, [ focused, nodeId, scopeId, selectScope, setLastFocusedNode ]);

  React.useEffect(() => {
    if (focusOnMount) {
      focusSelf();
    }
  }, [ focusOnMount, focusSelf ]);

  const focusProps = {
    ref,
    'data-focus-key': nodeId,
    'data-focus-active': active || undefined,
  };

  return {
    nodeId,
    scopeId,
    focused,
    active,
    focusSelf,
    focusProps,
  };
};
