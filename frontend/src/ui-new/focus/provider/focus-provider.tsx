import React from 'react';
import { type FocusDataContext, type FocusScopeId, focusRefsContext } from './focus-context';

export const FocusProvider: React.FC<{ initialScope?: string; children: React.ReactNode }> = ({ initialScope, children }) => {
  const scopeStackRef = React.useRef(initialScope ? [ initialScope ] : []);

  const data = React.useMemo((): FocusDataContext => {
    const setScopeStack: React.Dispatch<React.SetStateAction<FocusScopeId[]>> = (value) => {
      if (typeof value === 'function') {
        value = value(scopeStackRef.current);
      }

      if (scopeStackRef.current !== value) {

        const scopeIdsToUpdate = [ ...new Set([ scopeStackRef.current, value ]
          .map(stack => stack[ stack.length - 1 ])
          .filter(scopeId => typeof scopeId === 'string')) ];

        scopeStackRef.current = value;

        scopeIdsToUpdate
          .flatMap(scopeId => [ ...ctx.scopeListeners.get(scopeId) ?? [] ])
          .forEach(listener => listener());
      }
    };

    const ctx: FocusDataContext = {
      scopes: new Map(),
      nodes: new Map(),
      scopeStackRef,
      setScopeStack,
      scopeListeners: new Map(),
    };

    return ctx;
  }, [ scopeStackRef ]);

  // debug logging
  // React.useEffect(() => {
  //   console.log('focus', data);
  // }, [ data ]);

  return (
    <focusRefsContext.Provider value={data}>
      {children}
    </focusRefsContext.Provider>
  );
};
