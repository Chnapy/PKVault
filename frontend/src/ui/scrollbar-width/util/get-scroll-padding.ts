import type { MantineSize } from '@mantine/core';

export const getScrollPadding = (size: MantineSize) => `calc(var(--mantine-spacing-${size}) - var(--scrollbar-width))`;
