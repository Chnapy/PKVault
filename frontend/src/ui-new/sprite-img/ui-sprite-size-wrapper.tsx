import type React from 'react';

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
            '--storage-item-sprite-size': speciesSize && `var(--storage-item-sprite-size-${speciesSize})`,
            '--storage-item-sprite-rendering': speciesSize && `var(--storage-item-sprite-rendering-${speciesSize})`,

            '--storage-item-item-size': itemSize && `var(--storage-item-item-size-${itemSize})`,
            '--storage-item-item-rendering': itemSize && `var(--storage-item-item-rendering-${itemSize})`,

            ...style,
        } as React.CSSProperties}
    />;
};
