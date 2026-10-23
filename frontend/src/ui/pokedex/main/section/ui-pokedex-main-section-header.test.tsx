import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { UIPokedexMainSectionHeader } from './ui-pokedex-main-section-header';

describe('UIPokedexMainSectionHeader', () => {
  test('Living Dex view shows current owned progress', () => {
    const html = renderToStaticMarkup(<MantineProvider>
      <UIPokedexMainSectionHeader
        generation='Generation 1'
        regions={[]}
        games={null}
        seenCount={120}
        caughtCount={110}
        ownedCount={97}
        shinyCount={2}
        totalCount={151}
        showLivingDex
        ownedLabel='Owned'
      />
    </MantineProvider>);

    expect(html).toContain('97 / 151 Owned');
  });
});
