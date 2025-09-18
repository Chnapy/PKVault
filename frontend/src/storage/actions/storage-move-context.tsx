import React from 'react';
import { createPortal } from 'react-dom';
import { useStorageGetMainBoxes, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSaveBoxes, useStorageGetSavePkms, useStorageMovePkm } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';

type Context = {
    selected?: {
        id: string;
        storageType: 'main' | 'save';
        attached?: boolean;
        target?: {
            storageType: 'main' | 'save';
            boxId: number;
            boxSlot: number;
        };
    };
    setSelected: (selected: Context[ 'selected' ]) => void;
};

const context = React.createContext<Context>({
    setSelected: () => void 0,
});

export const StorageMoveContext = {
    containerId: 'storage-move-container',
    Provider: ({ children }: React.PropsWithChildren) => {
        const [ value, setValue ] = React.useState<Context>({
            setSelected: (selected) => setValue((context) => ({
                ...context,
                selected,
            })),
        });

        return <context.Provider value={value}>
            {children}
        </context.Provider>
    },
    useValue: () => React.useContext(context),
    useLoading: (storageType: 'main' | 'save', boxId: number, boxSlot: number, pkmId?: string) => {
        const { selected } = StorageMoveContext.useValue();

        const moveTarget = selected?.target;

        return !!moveTarget && (
            (moveTarget.storageType === storageType && moveTarget.boxId === boxId && moveTarget.boxSlot === boxSlot)
            || (selected.storageType === storageType && selected.id === pkmId)
        );
    },
    useClickable: (pkmId: string, storageType: 'main' | 'save') => {
        const moveContext = StorageMoveContext.useValue();

        const saveId = Route.useSearch({ select: (search) => search.save });

        const mainPkmsQuery = useStorageGetMainPkms();
        const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

        // const mainBoxesQuery = useStorageGetMainBoxes();
        // const saveBoxesQuery = useStorageGetSaveBoxes(saveId ?? 0);

        const pkmMain = !moveContext.selected && storageType === 'main' ? mainPkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;
        const pkmSave = !moveContext.selected && storageType === 'save' ? savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;

        // const boxMain = !moveContext.selected && storageType === 'main' ? mainBoxesQuery.data?.data.find(box => box.idInt === pkmMain?.boxId) : undefined;
        // const boxSave = !moveContext.selected && storageType === 'save' ? saveBoxesQuery.data?.data.find(box => box.idInt === pkmSave?.box) : undefined;

        const canClick = storageType === 'main'
            ? !!pkmMain
            : (pkmSave?.canMove || pkmSave?.canMoveToMain);

        const canClickAttached = storageType === 'main'
            ? pkmMain?.canMoveAttachedToSave
            : pkmSave?.canMoveAttachedToMain;

        return {
            onClick: canClick
                ? (() => {
                    moveContext.setSelected({
                        id: pkmId,
                        storageType,
                    });
                })
                : undefined,
            onClickAttached: canClickAttached
                ? (() => {
                    moveContext.setSelected({
                        id: pkmId,
                        storageType,
                        attached: true,
                    });
                })
                : undefined,
        };
    },
    useDraggable: (pkmId: string, storageType: 'main' | 'save') => {
        const ref = React.useRef<HTMLElement>(null);
        const moveContext = StorageMoveContext.useValue();

        const saveId = Route.useSearch({ select: (search) => search.save });

        const mainPkmsQuery = useStorageGetMainPkms();
        const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

        const pkmMain = !moveContext.selected && storageType === 'main' ? mainPkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;
        const pkmSave = !moveContext.selected && storageType === 'save' ? savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;

        const canClick = storageType === 'main'
            ? !!pkmMain
            : (pkmSave?.canMove || pkmSave?.canMoveToMain);

        React.useEffect(() => {
            if (
                ref.current
                && !moveContext.selected?.target
                && moveContext.selected?.id === pkmId
                && moveContext.selected?.storageType === storageType
            ) {
                const rect = ref.current.getBoundingClientRect();
                const { transform, pointerEvents } = ref.current.style;

                const moveHandler = (ev: Pick<MouseEvent, 'clientX' | 'clientY'>) => {
                    if (ref.current) {
                        const x = ev.clientX - rect.x;
                        const y = ev.clientY - rect.y;
                        ref.current.style.transform = `translate(${x}px, ${y}px)`;
                        ref.current.style.pointerEvents = 'none';
                    }
                };

                const upHandler = () => {
                    moveContext.setSelected(undefined);
                };

                document.addEventListener('pointermove', moveHandler);
                document.addEventListener('pointerup', upHandler);

                if (window.event instanceof PointerEvent
                    || window.event instanceof MouseEvent
                ) {
                    moveHandler(window.event);
                }

                return () => {
                    document.removeEventListener('pointermove', moveHandler);
                    document.removeEventListener('pointerup', upHandler);

                    if (ref.current) {
                        ref.current.style.transform = transform;
                        ref.current.style.pointerEvents = pointerEvents;
                    }
                };
            }
        }, [ moveContext, moveContext.selected, pkmId, storageType ]);

        let enablePointerMove = true;

        return {
            ref,
            onPointerMove: canClick
                ? ((e: React.PointerEvent) => {
                    if (enablePointerMove && e.buttons === 1) {
                        moveContext.setSelected({
                            id: pkmId,
                            storageType,
                        });
                        enablePointerMove = false;
                    }
                })
                : undefined,
            renderItem: (element: React.ReactNode) => moveContext.selected?.id === pkmId && moveContext.selected?.storageType === storageType
                ? createPortal(element, document.body.querySelector(`#${StorageMoveContext.containerId}`)!)
                : element,
        };
    },
    useDroppable: (dropStorageType: 'main' | 'save', dropBoxId: number, dropBoxSlot: number, pkmId?: string) => {
        const { selected, setSelected } = StorageMoveContext.useValue();

        const saveId = Route.useSearch({ select: (search) => search.save });
        const saveInfosQuery = useSaveInfosGetAll();

        const movePkmMutation = useStorageMovePkm();

        const mainBoxesQuery = useStorageGetMainBoxes();
        const saveBoxesQuery = useStorageGetSaveBoxes(saveId ?? 0);

        const mainPkmsQuery = useStorageGetMainPkms();
        const mainPkmVersionsQuery = useStorageGetMainPkmVersions();
        const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

        const isDragging = !!selected && !selected.target;
        const isCurrentItemDragging = selected?.id === pkmId && selected?.storageType === dropStorageType;

        const getCanClick = (): boolean => {
            if (!isDragging) {
                return false;
            }

            const save = saveId ? saveInfosQuery.data?.data[ saveId ] : undefined;

            const targetBoxMain = dropStorageType === 'main' ? mainBoxesQuery.data?.data.find(box => box.idInt === dropBoxId) : undefined;
            const targetBoxSave = dropStorageType === 'save' ? saveBoxesQuery.data?.data.find(box => box.idInt === dropBoxId) : undefined;

            const targetPkmMain = targetBoxMain && pkmId ? mainPkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;
            const targetPkmSave = targetBoxSave && pkmId ? savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;

            const sourcePkmMain = selected?.storageType === 'main' ? mainPkmsQuery.data?.data.find(pkm => pkm.id === selected.id) : undefined;
            const sourcePkmSave = selected?.storageType === 'save' ? savePkmsQuery.data?.data.find(pkm => pkm.id === selected.id) : undefined;

            const sourcePkmVersionMain = save && sourcePkmMain && mainPkmVersionsQuery.data?.data
                .find(version => version.pkmId === sourcePkmMain.id && version.generation === save.generation);
            // const targetPkmVersionMain = save && targetPkmMain && mainPkmVersionsQuery.data?.data
            //     .find(version => version.pkmId === targetPkmMain.id && version.generation === save.generation);

            // if (pkmId === "G30132C33359DD17 25 28 27 11 1200") {
            //     console.log('TEST', { targetBoxMain, targetBoxSave, targetPkmMain, targetPkmSave, sourcePkmMain, sourcePkmSave })
            // }

            if (
                (targetPkmMain && sourcePkmSave)
                || (targetPkmSave && sourcePkmMain)
                || (targetPkmMain && sourcePkmMain)
                || (targetPkmSave && sourcePkmSave)
            ) {
                return false;
            }

            let canClick = true;

            if (targetBoxSave) {
                canClick &&= targetBoxSave.canReceivePkm;
            }

            if (targetBoxMain) {
                canClick &&= targetBoxMain.canReceivePkm;
            }

            if (targetPkmMain && sourcePkmMain) {
                // canClick &&= boxMain.canReceivePkm;
            } else if (targetPkmSave && sourcePkmSave) {
                canClick &&= targetPkmSave.generation === sourcePkmSave.generation;
                canClick &&= targetPkmSave.canMove;
                // console.log(targetPkmSave.generation, sourcePkmSave.generation, targetPkmSave.canMove)
            }

            // if (selected.attached) {
            if (sourcePkmMain && targetBoxSave) {
                canClick &&= !!sourcePkmVersionMain;
            }
            if (sourcePkmSave && targetBoxMain) {
                // canClick &&= !!sourcePkmVersionMain;
            }
            // }

            return canClick;
        };

        const canClick = getCanClick();

        React.useEffect(() => {
            if (pkmId
                && selected?.id === pkmId
                && selected.target?.storageType === dropStorageType
                && selected.target.boxId === dropBoxId
                && selected.target.boxSlot === dropBoxSlot) {
                setSelected(undefined);
            }
        }, [ dropBoxId, dropBoxSlot, dropStorageType, pkmId, selected, setSelected ]);

        const onDrop = async () => {
            if (!selected) {
                return;
            }

            setSelected({
                ...selected,
                target: {
                    storageType: dropStorageType,
                    boxId: dropBoxId,
                    boxSlot: dropBoxSlot,
                },
            });

            // await new Promise(resolve => setTimeout(resolve, 3000));

            await movePkmMutation.mutateAsync({
                pkmId: selected.id,
                params: {
                    sourceSaveId: selected.storageType === 'save' ? saveId : undefined,
                    targetSaveId: dropStorageType === 'save' ? saveId : undefined,
                    targetBoxId: dropBoxId,
                    targetBoxSlot: dropBoxSlot,
                    attached: selected.attached,
                }
            }).finally(() => {
                // fallback if useEffect is not triggered for some reason
                setTimeout(() => setSelected(undefined), 150);
            });
        };

        // if (pkmId === "G3031079C7163A8 23 2 14 27 900") {
        //     console.log('TEST', isDragging, isCurrentItemDragging, canClick);
        // }

        return {
            isDragging,
            isCurrentItemDragging,
            onClick: canClick ? (async () => {
                await onDrop();
            }) : undefined,
            onPointerUp: canClick ? (async () => {
                await onDrop();
            }) : undefined,
        };
    },
};
