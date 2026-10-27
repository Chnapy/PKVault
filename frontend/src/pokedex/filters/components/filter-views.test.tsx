import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import { ControlsProvider } from '../../../ui/interaction/controls/provider/controls-provider';
import { FocusProvider } from '../../../ui/interaction/focus/provider/focus-provider';
import { FocusScope } from '../../../ui/interaction/focus/scope/focus-scope';
import { FilterViews } from './filter-views';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('../../../routes/pokedex', () => ({
  Route: {
    useNavigate: () => navigateMock,
    useSearch: ({ select }: { select: (search: object) => unknown }) => select({}),
  },
}));

beforeAll(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

afterAll(() => vi.unstubAllGlobals());

test('Living Dex view can be enabled without selecting Forms or Genders', async () => {
  render(<MantineProvider><ControlsProvider><FocusProvider><FocusScope id='test'>
    <FilterViews />
  </FocusScope></FocusProvider></ControlsProvider></MantineProvider>);

  fireEvent.click(screen.getByRole('checkbox', { name: 'Living Dex' }));

  await waitFor(() => expect(navigateMock).toHaveBeenCalledWith({
    search: {
      showForms: undefined,
      showGenders: undefined,
      showLivingDex: true,
    },
  }));
});
