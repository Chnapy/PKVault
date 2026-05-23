import { useFocusable, type UseFocusableConfig } from '@noriginmedia/norigin-spatial-navigation-react';
import React from 'react';
import type { FocusNodeId } from '../provider/focus-context';
import { Focus } from '../provider/use-focus-context';
import { useFocusScopeContext, useFocusScopeSelect } from '../scope/use-focus-scope-context';

export type UseFocusNodeParams = Pick<UseFocusableConfig<unknown>, 'onFocus'> & {
  scopeNodeId: FocusNodeId;
  focusOnMount?: boolean;
};

export const useFocusNode = ({ scopeNodeId, focusOnMount, onFocus }: UseFocusNodeParams) => {
  const { scopeId } = useFocusScopeContext();
  const selectScope = useFocusScopeSelect();

  // TODO trigger lot of rerenders
  const active = Focus.useIsScopeActive(scopeId);

  const { registerNode, unregisterNode, setLastFocusedNode } = Focus.useRegister();

  // nodeId prefixed by scopeId to avoid conflicts
  const nodeId = `${scopeId}_${scopeNodeId}`;

  const { ref, focused, focusSelf } = useFocusable({
    focusKey: nodeId,
    focusable: active,
    saveLastFocusedChild: false,
    trackChildren: false,
    isFocusBoundary: false,
    preferredChildFocusKey: undefined,
    onFocus: (layout, props, details) => {
      layout.node.focus();

      onFocus?.(layout, props, details);
    },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: ref as React.RefObject<any>,
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
