import { ActionIcon, Alert, Badge, Button, Card, createTheme, EmptyState, Menu, mergeThemeOverrides, NumberFormatter, Paper, Popover, Scroller, SegmentedControl, Tabs, Text, Tooltip } from '@mantine/core';
import { clsx } from 'clsx';
import { baseTheme, cssVariablesResolver } from './base-theme';
import classes from './theme.module.css';

const defaultClickOutsideEvents = [ 'pointerdown', 'touchstart' ];

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
          section: classes.buttonSection,
        }),
      }),
      ActionIcon: ActionIcon.extend({
        classNames: (theme, props) => ({
          root: classes.actionIcon,
        }),
      }),
      Badge: Badge.extend({
        defaultProps: {
          bdrs: 'md',
        },
      }),
      Text: Text.extend({
        classNames: (theme, props) => ({
          root: classes.text,
        }),
      }),
      NumberFormatter: NumberFormatter.extend({
        defaultProps: {
          thousandSeparator: "'",
        },
      }),
      Alert: Alert.extend({
        classNames: (theme, props) => ({
          title: classes.alertTitle,
          message: classes.alertMessage,
        }),
      }),
      Popover: Popover.extend({
        defaultProps: {
          // default value 'mousedown' doesn't work with disabled buttons
          clickOutsideEvents: defaultClickOutsideEvents,
        },
      }),
      Menu: Menu.extend({
        defaultProps: {
          // default value 'mousedown' doesn't work with disabled buttons
          clickOutsideEvents: defaultClickOutsideEvents,
        },
      }),
      Tooltip: Tooltip.extend({
        defaultProps: {
          fz: 'md',
          px: 'md',
          py: 'sm',
          lh: 'xs',
          maw: 300,
          style: {
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          },
          events: { hover: true, focus: true, touch: true },
          transitionProps: { duration: 0 },
        },
      }),
      SegmentedControl: SegmentedControl.extend({
        classNames: (theme, props) => ({
          root: classes.segmentedControl,
        }),
      }),
      EmptyState: EmptyState.extend({
        classNames: (theme, props) => ({
          root: classes.emptyState,
          title: classes.emptyStateTitle,
        }),
      }),
    },
  }),
);

export { cssVariablesResolver };
