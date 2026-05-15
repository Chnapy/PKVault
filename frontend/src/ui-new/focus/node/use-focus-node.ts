import { useFocusable, type UseFocusableConfig } from '@noriginmedia/norigin-spatial-navigation-react';
import React from 'react';
import type { FocusNodeId } from '../provider/focus-context';
import { Focus } from '../provider/use-focus-context';
import { useFocusScopeContext } from '../scope/focus-scope-context';

export const useFocusNode = <E extends HTMLElement>({ scopeNodeId, autoFocus, ...rest }: {
  scopeNodeId: FocusNodeId;
  autoFocus?: boolean;
} & UseFocusableConfig<unknown>) => {
  const scopeId = useFocusScopeContext();

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
    ...rest,
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
    }
  }, [ focused, scopeId, nodeId, setLastFocusedNode ]);
  
  React.useEffect(() => {
      if (autoFocus) {
          focusSelf();
      }
  }, [ autoFocus, focusSelf ]);

  return {
    ref,
    nodeId,
    focused,
    active,
    focusSelf,
  };
};
