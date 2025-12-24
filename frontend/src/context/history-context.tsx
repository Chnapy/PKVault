import { useRouter, type HistoryLocation } from '@tanstack/react-router';
import React from 'react';
import type { FileRoutesByTo } from '../routeTree.gen';

type ContextValue = {
    [ to in keyof FileRoutesByTo ]?: {
        to: to,
        search: FileRoutesByTo[ to ][ 'types' ][ 'searchSchema' ];
    };
};

const context = React.createContext<ContextValue>({});

const getHistoryValue = (value: ContextValue, location: HistoryLocation) => {
    const to = location.pathname as keyof FileRoutesByTo;
    const search = Object.fromEntries(Array.from(new URLSearchParams(location.search)).map(([ k, v ]) => [
        k,
        (() => {
            try {
                return JSON.parse(v)
            } catch {
                return;
            }
        })()
    ]));
    // console.log(location.href, to, search);

    const lastValue = value[ to ];
    if (!lastValue
        || JSON.stringify(lastValue.search) !== JSON.stringify(search)
    ) {
        return {
            ...value,
            [ to ]: {
                to,
                search,
            }
        };
    }

    return value;
};

export const HistoryContext = {
    Provider: ({ children }: React.PropsWithChildren) => {
        const history = useRouter().history;
        const [ value, setValue ] = React.useState<ContextValue>(() => {
            return getHistoryValue({}, history.location);
        });

        React.useEffect(() => {
            const handleLocation = ({ location }: { location: HistoryLocation }) => {
                setValue(value => {
                    return getHistoryValue(value, location);
                });
            };

            const unsubscribe = history.subscribe(handleLocation);

            return () => {
                unsubscribe();
            };
        }, [ history ]);

        return <context.Provider value={value}>
            {children}
        </context.Provider>
    },
    useValue: () => React.useContext(context),
};
