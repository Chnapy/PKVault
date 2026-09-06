import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import './global.css';

import { ColorSchemeScript, MantineProvider, type MantineProviderProps } from '@mantine/core';
import { LucideProvider } from 'lucide-react';
import type React from 'react';
import { ScrollbarWidthStyle } from './scrollbar-width/scrollbar-width-style';
import { cssVariablesResolver, theme } from './theme';

export const AppTheme: React.FC<Omit<MantineProviderProps, 'theme' | 'cssVariablesResolver'>> = ({ children, ...props }) => <MantineProvider
  theme={theme}
  cssVariablesResolver={cssVariablesResolver}
  {...props}
>
  <ColorSchemeScript />

  <LucideProvider>
    <ScrollbarWidthStyle />

    {children}
  </LucideProvider>
</MantineProvider>;
