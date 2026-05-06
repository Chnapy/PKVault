import { Button, Card, createTheme, mergeThemeOverrides, Paper, Tabs } from '@mantine/core';
import { baseTheme, cssVariablesResolver } from './base-theme';
import classes from './theme.module.css';

export const theme = mergeThemeOverrides(
  baseTheme,
  createTheme({
    components: {
      Paper: Paper.extend({
        classNames: (theme, props) => ({
          root: classes.paper,
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
          tab: classes.tabs,
        }),
      }),
      Button: Button.extend({
        defaultProps: {
          variant: 'default',
        },
        classNames: (theme, props) => ({
          root: classes.button,
        }),
      }),
    },
  }),
);

export { cssVariablesResolver };
