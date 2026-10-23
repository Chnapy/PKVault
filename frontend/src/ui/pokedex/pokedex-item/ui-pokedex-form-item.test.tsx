import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { UIPokedexFormItem } from './ui-pokedex-form-item';

describe('UIPokedexFormItem Living Dex view', () => {
  test.each([
    { name: 'owned but unseen', isSeen: false, isCaught: false, isOwned: true, silhouetted: false },
    { name: 'caught but unowned', isSeen: true, isCaught: true, isOwned: false, silhouetted: true },
    { name: 'seen but unowned', isSeen: true, isCaught: false, isOwned: false, silhouetted: true },
    { name: 'unknown', isSeen: false, isCaught: false, isOwned: false, silhouetted: true },
  ])('$name uses current ownership for the sprite', ({ isSeen, isCaught, isOwned, silhouetted }) => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(<MantineProvider>
      <UIPokedexFormItem genders={[]} isSeen={isSeen} isCaught={isCaught} isOwned={isOwned} showLivingDex>
        <span data-testid='sprite' />
      </UIPokedexFormItem>
    </MantineProvider>);

    expect(container.querySelector('[data-testid="sprite"]')?.parentElement?.style.filter).toBe(
      silhouetted ? 'brightness(0) opacity(0.4)' : ''
    );
  });

  test('mode off keeps seen based sprite visibility', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(<MantineProvider>
      <UIPokedexFormItem genders={[]} isSeen isOwned={false}>
        <span data-testid='sprite' />
      </UIPokedexFormItem>
    </MantineProvider>);

    expect(container.querySelector('[data-testid="sprite"]')?.parentElement?.style.filter).toBe('');
  });
});
