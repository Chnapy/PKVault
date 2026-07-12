import { ThemeIcon, type ThemeIconProps } from '@mantine/core';
import { EyeIcon, FolderIcon } from 'lucide-react';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIBallIcon } from '../../icon/ui-ball-icon';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';

export const UIPokedexIcons = {
    Seen: (props: ThemeIconProps) => <ThemeIcon variant='transparent' {...props}>
        <EyeIcon />
    </ThemeIcon>,
    Caught: (props: ThemeIconProps) => <ThemeIcon variant='transparent' c='red' {...props}>
        <UIBallIcon fill='var(--mantine-color-red-1)' />
    </ThemeIcon>,
    Owned: (props: ThemeIconProps) => <ThemeIcon variant='transparent' c='primary.6' {...props}>
        <FolderIcon fill='currentColor' />
    </ThemeIcon>,
    Shiny: ({ children, ...rest }: ThemeIconProps) => <ThemeIcon variant='transparent' {...rest}>
        {children ?? <UIShinyIcon />}
    </ThemeIcon>,
    Alpha: ({ children, ...rest }: ThemeIconProps) => <ThemeIcon variant='transparent' {...rest}>
        {children ?? <UIAlphaIcon />}
    </ThemeIcon>,
};
