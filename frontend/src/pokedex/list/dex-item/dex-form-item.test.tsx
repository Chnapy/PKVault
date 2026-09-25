import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { EntityContext } from '../../../data/sdk/model';
import { DexFormItem } from './dex-form-item';

vi.mock('../../../hooks/use-static-data', () => ({
  useStaticData: () => ({ species: {} }),
}));

vi.mock('../../../img/species-img', () => ({
  SpeciesImg: () => <span data-testid='sprite' />,
}));

test('a seen but unowned Dex form remains a silhouette in Living Dex view', () => {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(<MantineProvider>
    <DexFormItem
      species={1}
      context={EntityContext.Gen1}
      form={0}
      genders={[]}
      isSeen
      isCaught
      isOwned={false}
      showLivingDex
    />
  </MantineProvider>);

  expect(container.querySelector('[data-testid="sprite"]')?.parentElement?.style.filter)
    .toBe('brightness(0) opacity(0.4)');
});
