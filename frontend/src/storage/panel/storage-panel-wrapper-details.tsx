import { Stack } from '@mantine/core';
import React from 'react';
import { Route } from '../../routes/storage';
import type { PopoverContext } from '../../ui/interaction/focus-controls/components/popover/context/popover-context';
import { useMoveContext } from '../../ui/interaction/move/context/use-move-context';
import { useSelectContextNullable } from '../../ui/interaction/select/context/use-select-context';
import { UIStoragePanelWrapperDetails, type UIStoragePanelWrapperDetailsProps } from '../../ui/storage/storage-panel/ui-storage-panel-wrapper-details';
import { useStorageSelectExpanded } from '../details/hooks/use-storage-select-expanded';
import { MultiSelectActions } from '../details/multi-select-actions';
import { StorageDetails } from '../details/storage-details';
import type { MoveContainerValue } from '../move/move-container-fns';
import { useCurrentStorageWithFallback } from './hooks/use-current-storage-with-fallback';
import { StoragePanel } from './storage-panel';
import { useCurrentStorage } from './storage-panel-context';

const useOpened = () => {
    const storage = useCurrentStorageWithFallback();
    const { saveId = null, box } = storage.data ?? {};

    const { getSelected } = useCurrentStorage();

    const selectOpened = Route.useSearch({ select: search => getSelected(search.selected) !== undefined });

    const selectCtx = useSelectContextNullable<MoveContainerValue>();
    const multiSelectOpened = selectCtx?.useSelectStore(s => {
        if (s.ids.size === 0)
            return false;

        if (!box)
            return false;

        const currentContainer = selectCtx.getContainerHash(saveId
            ? {
                type: 'save-item',
                saveId,
                boxId: box.id,
            }
            : {
                type: 'main-item',
                boxId: box.id,
            });

        return s.container === currentContainer;
    }) ?? false;

    const opened = selectOpened || multiSelectOpened;

    return { opened, selectOpened, multiSelectOpened };
};

export const StoragePanelWrapperDetails: React.FC = () => {
    const { opened, selectOpened, multiSelectOpened } = useOpened();

    const { useMoveStore } = useMoveContext();
    const isMoveDragging = useMoveStore(({ state }) => state.status === 'dragging');

    const navigate = Route.useNavigate();

    const { expanded } = useStorageSelectExpanded();

    const position: UIStoragePanelWrapperDetailsProps[ 'position' ] = useCurrentStorage().storageIndex
        ? 'left-start'
        : 'right-start';

    const stateRef = React.useRef({ opened });

    React.useEffect(() => {
        stateRef.current = { opened };
    }, [ opened ])

    const setOpened: PopoverContext[ 'setOpened' ] = opened => {
        if (!opened) {
            navigate({
                search: {
                    selected: undefined,
                },
            });
        }
    };

    const seeThrough = isMoveDragging && stateRef.current.opened;

    return <UIStoragePanelWrapperDetails
        opened={opened}
        setOpened={setOpened}
        position={position}
        expanded={expanded}
        // eslint-disable-next-line react-hooks/refs
        seeThrough={seeThrough}
        details={<Stack w='100%'>
            {multiSelectOpened && <MultiSelectActions enabled={!selectOpened} />}

            {selectOpened && <StorageDetails />}
        </Stack>}
    >
        <StoragePanel />
    </UIStoragePanelWrapperDetails>;
};
