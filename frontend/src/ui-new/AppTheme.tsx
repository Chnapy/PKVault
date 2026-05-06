import { injectGlobal } from '@emotion/css';
import { ColorSchemeScript, MantineProvider, type MantineProviderProps } from '@mantine/core';
import type React from 'react';
import { cssVariablesResolver, theme } from './theme';

injectGlobal(/* css */`
  @import url('fonts/pixel-operator/font-face.css');
  @import url('fonts/pokemon-emerald/font-face.css');
`);

import '@mantine/core/styles.css';

injectGlobal(/* css */`
    * {
      scrollbar-width: thin;
    }

    [data-mantine-color-scheme="dark"] * {
      text-shadow: 1px 1px 0px rgba(255,255,255,0.2);
    }

    [data-mantine-color-scheme="light"] * {
      text-shadow: 1px 1px 0px rgba(0,0,0,0.2);
    }
`);

export const AppTheme: React.FC<Omit<MantineProviderProps, 'theme' | 'cssVariablesResolver'>> = ({ children, ...props }) => <MantineProvider
  theme={theme}
  cssVariablesResolver={cssVariablesResolver}
  {...props}
>
  <ColorSchemeScript />

  {children}
</MantineProvider>;
