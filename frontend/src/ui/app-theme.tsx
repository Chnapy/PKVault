import '@mantine/core/styles.css';
import './global.css';

import { ColorSchemeScript, MantineProvider, type MantineProviderProps } from '@mantine/core';
import { LucideProvider } from 'lucide-react';
import type React from 'react';
import { cssVariablesResolver, theme } from './theme';

export const AppTheme: React.FC<Omit<MantineProviderProps, 'theme' | 'cssVariablesResolver'>> = ({ children, ...props }) => <MantineProvider
  theme={theme}
  cssVariablesResolver={cssVariablesResolver}
  {...props}
>
  <ColorSchemeScript />

  <LucideProvider>
    {children}
  </LucideProvider>
</MantineProvider>;
