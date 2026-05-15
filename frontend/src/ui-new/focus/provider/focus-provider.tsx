import React from 'react';
import { type FocusNodeData, type FocusNodeId, type FocusScopeData, type FocusScopeId, focusRefsContext, focusScopeStackContext } from './focus-context';

export const FocusProvider: React.FC<{ initialScope: string; children: React.ReactNode }> = ({ initialScope, children }) => {
  const scopesRef = React.useRef(new Map<FocusScopeId, FocusScopeData>());
  const nodesRef = React.useRef(new Map<FocusNodeId, FocusNodeData>());

  const [ scopeStack, setScopeStack ] = React.useState<FocusScopeId[]>(initialScope ? [ initialScope ] : []);

  const refsValue = React.useMemo(() => ({
    scopesRef,
    nodesRef,
    setScopeStack,
  }), []);

  const scopeStackValue = React.useMemo(() => scopeStack, [ scopeStack ]);

  // debug logging
  React.useEffect(() => {
    console.log('focus', {
      scopeStack: scopeStackValue,
      ...refsValue,
    })
  }, [ refsValue, scopeStackValue ]);

  return (
    <focusRefsContext.Provider value={refsValue}>
      <focusScopeStackContext.Provider value={scopeStackValue}>
        {children}
      </focusScopeStackContext.Provider>
    </focusRefsContext.Provider>
  );
};
