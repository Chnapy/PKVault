import React from 'react';
import { createPortal } from 'react-dom';
import { useStorageGetMainBoxes, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSaveBoxes, useStorageGetSavePkms, useStorageMovePkm } from '../../data/sdk/storage/storage.gen';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import type { BoxDTO, PkmDTO, PkmSaveDTO } from '../../data/sdk/model';
import { useTranslate } from '../../translate/i18n';

type Context = {
    selected?: {
        id: string;
        saveId?: number;
        attached?: boolean;
        target?: {
            saveId?: number;
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
    useLoading: (saveId: number | undefined, boxId: number, boxSlot: number, pkmId?: string) => {
        const { selected } = StorageMoveContext.useValue();

        const moveTarget = selected?.target;

        return !!moveTarget && (
            (moveTarget.saveId === saveId && moveTarget.boxId === boxId && moveTarget.boxSlot === boxSlot)
            || (selected.saveId === saveId && selected.id === pkmId)
        );
    },
    useClickable: (pkmId: string, saveId: number | undefined) => {
        const moveContext = StorageMoveContext.useValue();

        const mainPkmsQuery = useStorageGetMainPkms();
        const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

        // const mainBoxesQuery = useStorageGetMainBoxes();
        // const saveBoxesQuery = useStorageGetSaveBoxes(saveId ?? 0);

        const pkmMain = !moveContext.selected && !saveId ? mainPkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;
        const pkmSave = !moveContext.selected && !!saveId ? savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;

        // const boxMain = !moveContext.selected && storageType === 'main' ? mainBoxesQuery.data?.data.find(box => box.idInt === pkmMain?.boxId) : undefined;
        // const boxSave = !moveContext.selected && storageType === 'save' ? saveBoxesQuery.data?.data.find(box => box.idInt === pkmSave?.box) : undefined;

        const canClick = !saveId
            ? !!pkmMain
            : (pkmSave?.canMove || pkmSave?.canMoveToMain);

        const canClickAttached = !saveId
            ? pkmMain?.canMoveAttachedToSave
            : pkmSave?.canMoveAttachedToMain;

        return {
            onClick: canClick
                ? (() => {
                    moveContext.setSelected({
                        id: pkmId,
                        saveId,
                    });
                })
                : undefined,
            onClickAttached: canClickAttached
                ? (() => {
                    moveContext.setSelected({
                        id: pkmId,
                        saveId,
                        attached: true,
                    });
                })
                : undefined,
        };
    },
    useDraggable: (pkmId: string, saveId: number | undefined) => {
        const ref = React.useRef<HTMLDivElement>(null);
        const moveContext = StorageMoveContext.useValue();

        const mainPkmsQuery = useStorageGetMainPkms();
        const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

        const pkmMain = !moveContext.selected && !saveId ? mainPkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;
        const pkmSave = !moveContext.selected && !!saveId ? savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;

        const canClick = !saveId
            ? !!pkmMain
            : (pkmSave?.canMove || pkmSave?.canMoveToMain);

        React.useEffect(() => {
            const containerEl = document.body.querySelector(`#${StorageMoveContext.containerId}`) as HTMLDivElement;

            if (
                ref.current
                && !moveContext.selected?.target
                && moveContext.selected?.id === pkmId
                && moveContext.selected.saveId === saveId
            ) {
                const rect = ref.current.parentElement!.getBoundingClientRect();
                const { transform } = ref.current.style;

                const moveHandler = (ev: Pick<MouseEvent, 'clientX' | 'clientY'>) => {
                    if (ref.current) {
                        const x = ev.clientX - rect.x;
                        const y = ev.clientY - rect.y;
                        ref.current.style.transform = `translate(${x}px, ${y}px)`;
                        // ref.current.style.pointerEvents = 'none';
                    }
                };

                const upHandler = () => {
                    moveContext.setSelected(undefined);
                };

                containerEl.addEventListener('pointermove', moveHandler);
                document.addEventListener('pointerup', upHandler);

                if (window.event instanceof PointerEvent
                    || window.event instanceof MouseEvent
                ) {
                    moveHandler(window.event);
                }

                return () => {
                    containerEl.removeEventListener('pointermove', moveHandler);
                    document.removeEventListener('pointerup', upHandler);

                    if (ref.current) {
                        ref.current.style.transform = transform;
                        // ref.current.style.pointerEvents = pointerEvents;
                    }
                };
            }
        }, [ moveContext, moveContext.selected, pkmId, saveId ]);

        let enablePointerMove = true;

        return {
            onPointerMove: canClick
                ? ((e: React.PointerEvent) => {
                    if (enablePointerMove && e.buttons === 1) {
                        moveContext.setSelected({
                            id: pkmId,
                            saveId,
                        });
                        enablePointerMove = false;
                    }
                })
                : undefined,
            renderItem: (element: React.ReactNode) => moveContext.selected?.id === pkmId && moveContext.selected.saveId === saveId
                ? createPortal(<div
                    ref={ref}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        pointerEvents: 'none',
                    }}>
                    {element}
                </div>, document.body.querySelector(`#${StorageMoveContext.containerId}`)!)
                : element,
        };
    },
    useDroppable: (saveId: number | undefined, dropBoxId: number, dropBoxSlot: number, pkmId?: string) => {
        const { t } = useTranslate();
        const { selected, setSelected } = StorageMoveContext.useValue();

        const saveInfosQuery = useSaveInfosGetAll();

        const movePkmMutation = useStorageMovePkm();

        const mainBoxesQuery = useStorageGetMainBoxes();
        const targetSaveBoxesQuery = useStorageGetSaveBoxes(saveId ?? 0);

        const mainPkmsQuery = useStorageGetMainPkms();
        const mainPkmVersionsQuery = useStorageGetMainPkmVersions();
        const sourceSavePkmsQuery = useStorageGetSavePkms(selected?.saveId ?? 0);
        const targetSavePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

        const isDragging = !!selected && !selected.target;
        const isCurrentItemDragging = selected?.id === pkmId && selected && selected.saveId === saveId;

        type ClickInfos = {
            enable: boolean;
            helpText?: string;
        };

        const getCanClick = (): ClickInfos => {
            if (!isDragging) {
                return { enable: false };
            }

            if (selected.id === pkmId) {
                return { enable: false };
            }

            if (selected.attached && pkmId) {
                return { enable: false, helpText: t('storage.move.attached-pkm') };
            }

            const sourceSave = selected?.saveId ? saveInfosQuery.data?.data[ selected.saveId ] : undefined;
            const targetSave = saveId ? saveInfosQuery.data?.data[ saveId ] : undefined;

            const targetBoxMain = !saveId ? mainBoxesQuery.data?.data.find(box => box.idInt === dropBoxId) : undefined;
            const targetBoxSave = saveId ? targetSaveBoxesQuery.data?.data.find(box => box.idInt === dropBoxId) : undefined;

            const targetPkmMain = targetBoxMain && pkmId ? mainPkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;
            const targetPkmSave = targetBoxSave && pkmId ? targetSavePkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;

            const sourcePkmMain = !selected?.saveId ? mainPkmsQuery.data?.data.find(pkm => pkm.id === selected.id) : undefined;
            const sourcePkmSave = selected?.saveId ? sourceSavePkmsQuery.data?.data.find(pkm => pkm.id === selected.id) : undefined;

            const getPkmNickname = (id: string) => mainPkmVersionsQuery.data?.data.find(pkm => pkm.pkmId === id)?.nickname;

            const checkBetweenSlot = (
                targetBoxMain?: BoxDTO, targetBoxSave?: BoxDTO,
                targetPkmMain?: PkmDTO, targetPkmSave?: PkmSaveDTO,
                sourcePkmMain?: PkmDTO, sourcePkmSave?: PkmSaveDTO,
            ): ClickInfos => {
                // * -> box save
                if (targetBoxSave) {
                    if (!targetBoxSave.canReceivePkm) {
                        return { enable: false, helpText: t('storage.move.box-cannot', { name: targetBoxSave.name }) };
                    }
                }

                // * -> box main
                if (targetBoxMain) {
                    if (!targetBoxMain.canReceivePkm) {
                        return { enable: false, helpText: t('storage.move.box-cannot', { name: targetBoxMain.name }) };
                    }
                }

                // pkm main -> main
                if (sourcePkmMain && (targetBoxMain || targetPkmMain)) {
                    if (selected.attached) {
                        return { enable: false, helpText: t('storage.move.attached-main-self') };
                    }
                }

                // pkm save -> save
                else if (sourcePkmSave && (targetBoxSave || targetPkmSave)) {
                    if (selected.attached) {
                        return { enable: false, helpText: t('storage.move.attached-save-self') };
                    }

                    if (sourceSave && targetSave && sourceSave.generation !== targetSave.generation) {
                        return { enable: false, helpText: t('storage.move.save-same-gen', { generation: sourceSave.generation }) };
                    }

                    if (targetPkmSave) {
                        if (!targetPkmSave.canMove) {
                            return { enable: false, helpText: t('storage.move.pkm-cannot', { name: targetPkmSave.nickname }) };
                        }
                    }
                    // console.log(targetPkmSave.generation, sourcePkmSave.generation, targetPkmSave.canMove)
                }

                // pkm main -> save
                else if (sourcePkmMain && (targetBoxSave || targetPkmSave)) {
                    if (!(selected.attached ? sourcePkmMain.canMoveAttachedToSave : sourcePkmMain.canMoveToSave)) {
                        return {
                            enable: false,
                            helpText: sourcePkmMain.saveId
                                ? t('storage.move.pkm-cannot-attached-already', { name: getPkmNickname(sourcePkmMain.id) })
                                : (selected.attached ? t('storage.move.pkm-cannot-attached', { name: getPkmNickname(sourcePkmMain.id) }) : t('storage.move.pkm-cannot', { name: getPkmNickname(sourcePkmMain.id) })),
                        };
                    }

                    const relatedPkmVersions = mainPkmVersionsQuery.data?.data.filter(version => version.pkmId === sourcePkmMain.id) ?? [];

                    if (!targetSave || !relatedPkmVersions.some(version => version.generation === targetSave.generation)) {
                        return { enable: false, helpText: t('storage.move.main-need-gen', { name: getPkmNickname(sourcePkmMain.id), generation: targetSave?.generation }) };
                    }

                    if (!selected.attached) {
                        if (relatedPkmVersions.length > 1) {
                            return { enable: false, helpText: t('storage.move.attached-multiple-versions', { name: getPkmNickname(sourcePkmMain.id) }) };
                        }
                    }
                }

                // pkm save -> main
                else if (sourcePkmSave && (targetBoxMain || targetPkmMain)) {
                    if (sourcePkmSave.isEgg) {
                        return { enable: false, helpText: t('storage.move.save-egg') };
                    }

                    if (sourcePkmSave.isShadow) {
                        return { enable: false, helpText: t('storage.move.save-shadow') };
                    }

                    if (!(selected.attached ? sourcePkmSave.canMoveAttachedToMain : sourcePkmSave.canMoveToMain)) {
                        return {
                            enable: false, helpText: selected.attached
                                ? t('storage.move.pkm-cannot-attached', { name: getPkmNickname(sourcePkmSave.id) })
                                : t('storage.move.pkm-cannot', { name: getPkmNickname(sourcePkmSave.id) })
                        };
                    }
                }

                if (targetBoxMain || targetBoxSave) {
                    if (targetPkmMain && sourcePkmMain) {
                        return checkBetweenSlot(
                            undefined, undefined,
                            sourcePkmMain, undefined,
                            targetPkmMain, undefined,
                        );
                    }

                    if (targetPkmSave && sourcePkmSave) {
                        return checkBetweenSlot(
                            undefined, undefined,
                            undefined, sourcePkmSave,
                            undefined, targetPkmSave,
                        );
                    }

                    if (targetPkmMain && sourcePkmSave) {
                        return checkBetweenSlot(
                            undefined, undefined,
                            undefined, sourcePkmSave,
                            targetPkmMain, undefined,
                        );
                    }

                    if (targetPkmSave && sourcePkmMain) {
                        return checkBetweenSlot(
                            undefined, undefined,
                            sourcePkmMain, undefined,
                            undefined, targetPkmSave,
                        );
                    }
                }

                return { enable: true };
            };

            return checkBetweenSlot(
                targetBoxMain, targetBoxSave,
                targetPkmMain, targetPkmSave,
                sourcePkmMain, sourcePkmSave
            );
        };

        const clickInfos = getCanClick();

        React.useEffect(() => {
            if (pkmId
                && selected?.id === pkmId
                && selected.target
                && selected.target.saveId === saveId
                && selected.target.boxId === dropBoxId
                && selected.target.boxSlot === dropBoxSlot) {
                setSelected(undefined);
            }
        }, [ dropBoxId, dropBoxSlot, saveId, pkmId, selected, setSelected ]);

        const onDrop = async () => {
            if (!selected) {
                return;
            }

            setSelected({
                ...selected,
                target: {
                    saveId,
                    boxId: dropBoxId,
                    boxSlot: dropBoxSlot,
                },
            });

            // await new Promise(resolve => setTimeout(resolve, 3000));

            await movePkmMutation.mutateAsync({
                pkmId: selected.id,
                params: {
                    sourceSaveId: selected.saveId,
                    targetSaveId: saveId,
                    targetBoxId: dropBoxId,
                    targetBoxSlot: dropBoxSlot,
                    attached: selected.attached,
                }
            }).finally(() => {
                // fallback if useEffect is not triggered for some reason
                setTimeout(() => setSelected(undefined), 150);
            });
        };

        return {
            isDragging,
            isCurrentItemDragging,
            onClick: clickInfos.enable ? (async () => {
                await onDrop();
            }) : undefined,
            onPointerUp: clickInfos.enable ? (async () => {
                await onDrop();
            }) : undefined,
            helpText: clickInfos.helpText,
        };
    },
};
