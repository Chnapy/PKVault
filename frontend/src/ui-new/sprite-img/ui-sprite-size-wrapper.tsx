import type React from 'react';
import { switchUtil } from '../../util/switch-util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReactTag = keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<{ style: any }>;

type UISpriteSizeWrapperProps<T extends ReactTag = ReactTag> = {
    component: T;
    speciesSize?: 'sm' | 'md' | 'lg';
    itemSize?: '1lh' | 'md' | 'lg';
} & Omit<React.ComponentProps<T>, 'component'>;

export function UISpriteSizeWrapper<T extends ReactTag>({ component: Component, speciesSize, itemSize, style, ...rest }: UISpriteSizeWrapperProps<T>) {
    return <Component
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...rest as any}
        style={{
            '--sprite-species-size-multiplier': speciesSize && switchUtil(speciesSize, {
                sm: 0.5,
                md: 1,
                lg: 2,
            }),
            '--sprite-species-rendering': speciesSize && switchUtil(speciesSize, {
                sm: 'auto',
                md: undefined,
                lg: undefined,
            }),

            '--sprite-item-size-multiplier': itemSize && switchUtil(itemSize, {
                '1lh': 0.827,
                md: 1,
                lg: 2,
            }),
            '--sprite-item-rendering': itemSize && switchUtil(itemSize, {
                '1lh': 'auto',
                md: undefined,
                lg: undefined,
            }),

            ...style,
        } as React.CSSProperties}
    />;
};
