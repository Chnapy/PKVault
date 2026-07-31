import React from 'react';
import { controlsContext } from './controls-context';

export const useControlsContext = () => {
  const context = React.use(controlsContext);
  if (!context) {
    throw new Error('Component must be inside ControlsProvider');
  }
  return context;
};
