import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useClickLoading = <F extends ((...args: any[]) => unknown) | undefined>(
    onClickFn: F,
    loading = false
) => {
    const [ loadingInner, setLoading ] = React.useState(false);

    const onClick = onClickFn && ((...args) => {
        const result: unknown = onClickFn(...args);
        if (result instanceof Promise) {
            setLoading(true);
            result.finally(() => setLoading(false));
        }
    }) as F;

    return {
        onClick,
        loading: loading || loadingInner,
    };
};
