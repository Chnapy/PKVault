import { css, injectGlobal } from '@emotion/css';
import { Button, Card, ColorSchemeScript, createTheme, MantineProvider, Paper, rem, Tabs, type CSSVariablesResolver, type MantineProviderProps } from '@mantine/core';
import type React from 'react';

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
//--mantine-color-primary-light-hover
const theme = createTheme({
  fontFamily: "'Pixel Operator', sans-serif",
  primaryShade: { light: 6, dark: 6 },
  primaryColor: 'primary',
  white: '#f4eae0', // --mantine-color-white, card/body bg (light) #f0e9e0 '#fef4ea',
  black: '#3a1e08', // --mantine-color-text, text color (dark)
  autoContrast: true,
  components: {
    Paper: Paper.extend({
      classNames: (theme, props) => ({
        root: css`
          [data-mantine-color-scheme='light'] & {
            background-color: var(--mantine-color-white-4);
          }
        `,
      }),
    }),
    Card: Card.extend({
      defaultProps: {
        shadow: 'sm',
        withBorder: true,
      },
    }),
    Tabs: Tabs.extend({
      classNames: (theme, props) => ({
        tab: css`
          &[data-variant='outline'][data-active='true'] {
            /* background-color: var(--mantine-color-white-4); */
            background-color: light-dark(var(--mantine-color-white-4), var(--mantine-color-dark-6));
          }
        `,
      }),
    }),
    Button: Button.extend({
      defaultProps: {
        variant: 'default',
      },
      classNames: (theme, props) => ({
        root: css`
          [data-mantine-color-scheme='light'] &[data-variant='white'] {
            --button-hover: var(--mantine-color-gray-0) !important;
          }
        `,
      }),
    }),
  },
  shadows: {
    xs: `0 ${rem(1)} 0 rgba(0, 0, 0, 0.05)`,
    sm: `0 ${rem(2)} 0 rgba(0, 0, 0, 0.05)`,
    md: `0 ${rem(3)} 0 rgba(0, 0, 0, 0.05)`,
    lg: `0 ${rem(4)} 0 rgba(0, 0, 0, 0.05)`,
    xl: `0 ${rem(5)} 0 rgba(0, 0, 0, 0.05)`,
  },
  colors: {
    white: [
      '#f4f4f4',
      '#f5f4f2',
      '#f8f3ee',
      '#fbf3eb',
      '#faf6f0',  // --mantine-color-white-4, --mantine-color-body (light)
      '#f4eae0',  // --mantine-color-white-5
      '#f0e9e0',  // --mantine-color-white-6
      '#e4dbd0',
      '#874605',
      '#190c00'
    ],
    gray: [
      '#ede2d8',  // Button hover
      '#d2cdc2',
      '#c0baae',
      '#cfc4b8',  // --mantine-color-gray-3, card border
      '#bfb4a8',
      '#9c9587',
      '#7b7467',
      '#565249',
      '#322f2b',
      '#0d0d0d'
    ],
    // #B6634E / #934E3D
    primary: [
      '#f5e5e4',
      '#f0e8e2',
      '#ecdeda',
      '#d5a89d',
      '#cd9688',
      '#cd9688',
      '#B6634E',
      '#934E3D',
      '#4b271e',
      '#150905'
    ],
  },
});

const cssVariablesResolver: CSSVariablesResolver = (theme) => ({
  variables: {},
  light: {
    '--button-hover': 'var(--mantine-color-gray-0)',
    // '--mantine-color-body': '#f4f4f5',
    // '--mantine-color-default': '#ffffff',
    // '--mantine-color-default-border': '#d4d4d8',
  },
  dark: {
    // '--mantine-color-body': '#111113',
    // '--mantine-color-default': '#1c1c1f',
    // '--mantine-color-default-border': '#3f3f46',
  },
});
