import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn = (...args: any) => any;

export const useSelectCallback = <T extends Fn>(callback: T, deps: React.DependencyList): T => {
    const cacheRef = React.useRef<[ unknown[], React.DependencyList, unknown, string ]>([ [], [], undefined, '' ]);

    return React.useCallback(((...params) => {
        if (
            cacheRef.current[ 0 ].length === params.length
            && cacheRef.current[ 0 ].every((param, i) => param === params[ i ])
            && cacheRef.current[ 1 ].length === deps.length
            && cacheRef.current[ 1 ].every((param, i) => param === deps[ i ])
        ) {
            // console.log('cache-1')
            return cacheRef.current[ 2 ] as ReturnType<T>;
        }

        const result = callback(...params);

        if (cacheRef.current[ 2 ] === result
            || cacheRef.current[ 3 ] === JSON.stringify(result)
        ) {
            // console.log('cache-2')
            return cacheRef.current[ 2 ];
        }
        // console.log('no-cache')

        cacheRef.current = [
            params,
            deps,
            result,
            JSON.stringify(result),
        ];

        return result;
        // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
    }) as T, deps);
};
