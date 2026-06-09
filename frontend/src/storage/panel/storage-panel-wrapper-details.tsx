import { Stack } from '@mantine/core';
import React from 'react';
import { Route } from '../../routes/storage';
import type { PopoverContext, PopoverStore } from '../../ui-new/interaction/focus-controls/components/popover/context/popover-context';
import { useMoveContext } from '../../ui-new/interaction/move/context/use-move-context';
import { useSelectContextNullable } from '../../ui-new/interaction/select/context/use-select-context';
import { UIStoragePanelWrapperDetails } from '../../ui-new/storage/storage-panel/ui-storage-panel-wrapper-details';
import { MultiSelectActions } from '../details/multi-select-actions';
import { StorageDetails } from '../details/storage-details';
import type { MoveContainerValue } from '../move/move-container-fns';
import { StoragePanel } from './storage-panel';
import { useCurrentStorage } from './storage-panel-context';

const useOpened = () => {
    const { getStorage, getSelected } = useCurrentStorage();
    const saveId = Route.useSearch({ select: search => getStorage(search.storages)?.saveId }) ?? null;
    const boxId = Route.useSearch({ select: search => getStorage(search.storages)?.boxId });

    const selectOpened = Route.useSearch({ select: search => getSelected(search.selected) !== undefined });

    const selectCtx = useSelectContextNullable<MoveContainerValue>();
    const multiSelectOpened = selectCtx?.useSelectStore(s => {
        if (s.ids.size === 0)
            return false;

        const container = selectCtx.getContainerValue(s.container);
        return container.saveId === saveId
            && Number(container.boxId) === boxId;
    }) ?? false;

    const opened = selectOpened || multiSelectOpened;

    return { opened, selectOpened, multiSelectOpened };
};

const getUsePopoverStore = () => ((fn) => {
    const { opened } = useOpened();
    const state: PopoverStore = React.useMemo(() => ({ opened }), [ opened ]);

    if (!fn) return state;

    const result = fn(state);
    return result;
}) as PopoverContext[ 'usePopoverStore' ];

export const StoragePanelWrapperDetails: React.FC = () => {
    const { opened, selectOpened, multiSelectOpened } = useOpened();

    const { useMoveStore } = useMoveContext();
    const isMoveDragging = useMoveStore(({ state }) => state.status === 'dragging');

    const navigate = Route.useNavigate();

    const stateRef = React.useRef({ opened });

    React.useEffect(() => {
        stateRef.current = { opened };
    }, [ opened ])

    const usePopoverStore = React.useMemo(() => {
        const hook = getUsePopoverStore();

        hook.getState = () => stateRef.current;
        hook.setState = (stateFn) => {
            const nextPartialState = typeof stateFn === 'function'
                ? stateFn(stateRef.current)
                : stateFn;
            stateRef.current = {
                ...stateRef.current,
                ...nextPartialState,
            };

            if (!stateRef.current.opened) {
                navigate({
                    search: {
                        selected: undefined,
                    },
                });
            }
        };

        return hook;
    }, [ navigate ]);

    const context = React.useMemo((): PopoverContext => ({
        usePopoverStore,
    }), [ usePopoverStore ]);

    const seeThrough = isMoveDragging && stateRef.current.opened;

    return <UIStoragePanelWrapperDetails
        // eslint-disable-next-line react-hooks/refs
        seeThrough={seeThrough}
        context={context}
        details={<Stack>
            {multiSelectOpened && <MultiSelectActions enabled={!selectOpened} />}

            {selectOpened && <StorageDetails />}
        </Stack>}
    >
        <StoragePanel />
    </UIStoragePanelWrapperDetails>;
};
