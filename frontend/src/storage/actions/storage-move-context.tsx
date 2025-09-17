import React from 'react';
import { createPortal } from 'react-dom';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetMainPkmVersions, useStorageMainMovePkm, useStorageSaveMovePkm, useStorageSaveMovePkmFromStorage, useStorageSaveMovePkmToStorage } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';

type Context = {
    selected?: {
        id: string;
        storageType: 'main' | 'save';
        // slot: number;
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

        return {
            onClick: !moveContext.selected
                ? (() => {
                    moveContext.setSelected({
                        id: pkmId,
                        storageType,
                    });
                })
                : undefined,
        };
    },
    useDraggable: (pkmId: string, storageType: 'main' | 'save') => {
        const ref = React.useRef<HTMLElement>(null);
        const moveContext = StorageMoveContext.useValue();

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
            onPointerMove: !moveContext.selected
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

        const pkmVersionsQuery = useStorageGetMainPkmVersions();
        const saveInfosRecord = useSaveInfosGetAll().data?.data;
        const saveInfos = saveId ? saveInfosRecord?.[ saveId ] : undefined;

        const mainMovePkmMutation = useStorageMainMovePkm();
        const saveMovePkmMutation = useStorageSaveMovePkm();
        const saveMovePkmFromStorageMutation = useStorageSaveMovePkmFromStorage();
        const saveMovePkmToStorageMutation = useStorageSaveMovePkmToStorage();

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

            if (
                selected.storageType === "main" &&
                dropStorageType === "main"
            ) {
                await mainMovePkmMutation.mutateAsync({
                    pkmId: selected.id,
                    params: {
                        boxId: dropBoxId,
                        boxSlot: dropBoxSlot,
                    },
                });
            } else if (
                saveId &&
                selected.storageType === "save" &&
                dropStorageType === "save"
            ) {
                await saveMovePkmMutation.mutateAsync({
                    saveId,
                    pkmId: selected.id,
                    params: {
                        boxId: dropBoxId,
                        boxSlot: dropBoxSlot,
                    },
                });
            } else if (
                saveInfos &&
                selected.storageType === "main" &&
                dropStorageType === "save"
            ) {
                const savePkmVersion = pkmVersionsQuery.data?.data.find(
                    (pkmVersion) => pkmVersion.pkmId === selected.id && pkmVersion.generation === saveInfos.generation,
                );
                if (!savePkmVersion) {
                    throw new Error(
                        `PkmVersion not found for pkm.id=${selected.id} generation=${saveInfos.generation}`
                    );
                }

                await saveMovePkmFromStorageMutation.mutateAsync({
                    saveId: saveInfos.id,
                    params: {
                        pkmVersionId: savePkmVersion.id,
                        saveBoxId: dropBoxId,
                        saveSlot: dropBoxSlot,
                    },
                });
            } else if (
                saveId &&
                selected.storageType === "save" &&
                dropStorageType === "main"
            ) {
                await saveMovePkmToStorageMutation.mutateAsync({
                    saveId,
                    params: {
                        savePkmId: selected.id,
                        storageBoxId: dropBoxId,
                        storageSlot: dropBoxSlot,
                    },
                });
            }

            // fallback if useEffect is not triggered for some reason
            setTimeout(() => setSelected(undefined), 100);
        };

        return {
            onClick: (selected && !selected.target) ? (async () => {
                await onDrop();
            }) : undefined,
            onPointerUp: (selected && !selected.target) ? (async () => {
                await onDrop();
            }) : undefined,
        };
    },
};
