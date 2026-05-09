import { Button, Card, createTheme, mergeThemeOverrides, Paper, Scroller, Tabs } from '@mantine/core';
import { clsx } from 'clsx';
import { baseTheme, cssVariablesResolver } from './base-theme';
import classes from './theme.module.css';

export const theme = mergeThemeOverrides(
  baseTheme,
  createTheme({
    components: {
      Paper: Paper.extend({
        classNames: (theme, props) => ({
          root: clsx(
            classes.paper,
            props.withBorder && classes.paperBorder
          ),
        }),
      }),
      Card: Card.extend({
        defaultProps: {
          shadow: 'sm',
          withBorder: true,
        },
      }),
      Scroller: Scroller.extend({
        classNames: (theme, props) => ({
          root: classes.scroller,
          control: classes.scrollerControl,
          chevron: classes.scrollerChevron,
        }),
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
