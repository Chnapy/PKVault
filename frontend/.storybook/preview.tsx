import type { Preview, StoryContext } from '@storybook/react-vite';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { AppTheme } from '../src/ui-new/app-theme';
import { initFocus } from '../src/ui-new/focus/init-focus';

initFocus();

function withRouter(Story: any, { parameters }: StoryContext) {
  const { initialEntries = [ '/' ], initialIndex, routes = [ '/' ] } = parameters?.router || {};

  const rootRoute = createRootRoute();

  const children = (routes as string[]).map((path) =>
    createRoute({
      path,
      getParentRoute: () => rootRoute,
      component: Story,
    }),
  );

  rootRoute.addChildren(children);

  const router = createRouter({
    history: createMemoryHistory({ initialEntries, initialIndex }),
    routeTree: rootRoute,
  });

  return <RouterProvider router={router} />;
};

const preview: Preview = {

  parameters: {
    layout: 'fullscreen',
    options: {
      showPanel: false,
      storySort: (a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }),
    },
    backgrounds: { disable: true },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },
  },

  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Mantine color scheme',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },

  decorators: [
    (Story, ctx) => {
      const scheme = (ctx.globals.theme || 'light') as 'light' | 'dark';
      return (
        <AppTheme forceColorScheme={scheme}>
          {/* <Story /> */}
          {withRouter(Story, ctx)}
        </AppTheme>
      );
    }
  ],
};

export default preview;
