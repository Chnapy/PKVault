import React from 'react';

const visibilityContext = React.createContext(false);

export const VisibilityProvider = visibilityContext.Provider;

export const useVisibilityContext = () => React.use(visibilityContext);
