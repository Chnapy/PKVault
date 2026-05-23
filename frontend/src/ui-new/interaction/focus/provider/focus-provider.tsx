import React from 'react';
import { type FocusDataContext, createFocusStore, focusRefsContext } from './focus-context';

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ data ] = React.useState((): FocusDataContext => ({
    useFocusStore: createFocusStore(),
  }));

  // debug logging
  React.useEffect(() => {
    data.useFocusStore.subscribe(s => console.log('scopeStack', s.scopeStack))
  }, [ data ]);

  return (
    <focusRefsContext.Provider value={data}>
      {children}
    </focusRefsContext.Provider>
  );
};
