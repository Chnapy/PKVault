import { ThemeIcon, type ThemeIconProps } from '@mantine/core';
import { CopyIcon, EyeIcon, FolderIcon, LinkIcon, SlashIcon, SparklesIcon, TriangleAlertIcon } from 'lucide-react';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIBallIcon } from '../../icon/ui-ball-icon';
import { UIMegaIcon } from '../../icon/ui-mega-icon';
import { UINIcon } from '../../icon/ui-n-icon';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';

export const UIPokedexIcons = {
    Seen: (props: ThemeIconProps) => <ThemeIcon component='span' variant='transparent' {...props}>
        <EyeIcon />
    </ThemeIcon>,
    Caught: (props: ThemeIconProps) => <ThemeIcon component='span' variant='transparent' c='red' {...props}>
        <UIBallIcon style={{
            fill: 'light-dark(var(--mantine-color-red-1), transparent)',
        }} />
    </ThemeIcon>,
    Owned: (props: ThemeIconProps) => <ThemeIcon component='span' variant='transparent' c='primary.6' {...props}>
        <FolderIcon fill='currentColor' />
    </ThemeIcon>,
    Shiny: ({ children, ...rest }: ThemeIconProps) => <ThemeIcon component='span' variant='transparent' {...rest}>
        {children ?? <UIShinyIcon />}
    </ThemeIcon>,
    Alpha: ({ children, ...rest }: ThemeIconProps) => <ThemeIcon component='span' variant='transparent' {...rest}>
        {children ?? <UIAlphaIcon />}
    </ThemeIcon>,
    Mega: ({ children, ...rest }: ThemeIconProps) => <ThemeIcon component='span' variant='transparent' {...rest}>
        {children ?? <UIMegaIcon size='big' />}
    </ThemeIcon>,
    N: ({ children, ...rest }: ThemeIconProps) => <ThemeIcon component='span' variant='transparent' {...rest}>
        {children ?? <UINIcon />}
    </ThemeIcon>,
    Warn: ({ children, ...rest }: ThemeIconProps) => <ThemeIcon component='span' variant='transparent' color='yellow' {...rest}>
        <TriangleAlertIcon />
    </ThemeIcon>,
    Evolve: ({ children, ...rest }: ThemeIconProps) => <ThemeIcon component='span' variant='transparent' color='blue' {...rest}>
        <SparklesIcon />
    </ThemeIcon>,
    Duplicate: ({ children, ...rest }: ThemeIconProps) => <ThemeIcon component='span' variant='transparent' color='yellow' {...rest}>
        <CopyIcon />
    </ThemeIcon>,
    Attached: ({ needSynchronize, attachBroken, children, ...rest }: ThemeIconProps & {
        needSynchronize?: boolean;
        attachBroken?: boolean;
    }) => <ThemeIcon component='span' variant='transparent' color={attachBroken ? 'red' : needSynchronize ? 'yellow' : undefined} {...rest}>
            {attachBroken
                ? <SlashIcon transform='scale(-1,1)'>
                    <LinkIcon style={{ transform: 'scale(-1,1) translateX(-100%)' }} />
                </SlashIcon>
                : <LinkIcon />}
        </ThemeIcon>,
};
