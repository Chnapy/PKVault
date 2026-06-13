import React from 'react';
import { selectContext, type SelectContext } from './select-context';

export const useSelectContextNullable = <C>() => {
    return React.use<SelectContext<C> | null>(selectContext);
};

export const useSelectContext = <C>() => {
    const ctx = useSelectContextNullable<C>();
    if (!ctx) {
        throw new Error('Should be used inside SelectProvider');
    }
    return ctx;
};

export const useSelectHasValue = <C>(container: C, ids: string[]) => {
    const { getContainerHash, useSelectStore } = useSelectContext<C>();

    return useSelectStore(state => state.container === getContainerHash(container)
        && ids.every(id => state.ids.has(id)));
};

export const useSelectContextActions = <C>() => {
    const { getContainerHash, useSelectStore } = useSelectContext<C>();

    return {
        addId: React.useCallback((container: C, ids: string[]) => {
            if (ids.length === 0)
                return;

            const value = useSelectStore.getState();

            const containerHash = getContainerHash(container);

            if (value.container !== containerHash)
                return useSelectStore.setState({
                    container: containerHash,
                    ids: new Set(ids),
                });

            const updatedIds = [ ...value.ids, ...ids.filter(id => !value.ids.has(id)) ];

            if (updatedIds.length === value.ids.size)
                return;

            useSelectStore.setState({
                container: containerHash,
                ids: new Set(updatedIds),
            });
        }, [ getContainerHash, useSelectStore ]),
        removeId: React.useCallback((ids: string[]) => {
            if (ids.length === 0)
                return;

            const value = useSelectStore.getState();

            const valueCopy = new Set([ ...value.ids ]);
            ids.forEach(id => valueCopy.delete(id));

            if (valueCopy.size === value.ids.size)
                return;

            useSelectStore.setState({
                ...value,
                ids: valueCopy,
            });
        }, [ useSelectStore ]),
        clear: React.useCallback(() => {
            const value = useSelectStore.getState();

            if (value.ids.size === 0)
                return;

            useSelectStore.setState({
                ...value,
                ids: new Set(),
            });
        }, [ useSelectStore ]),
    };
};
