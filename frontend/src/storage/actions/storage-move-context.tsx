import React from 'react';
import { createPortal } from 'react-dom';
import type { BoxDTO, PkmDTO, PkmSaveDTO } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetMainBoxes, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSaveBoxes, useStorageGetSavePkms, useStorageMovePkm } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { filterIsDefined } from '../../util/filter-is-defined';
import { StorageSelectContext } from './storage-select-context';

type Context = {
    selected?: {
        ids: string[];
        saveId?: number;
        attached?: boolean;
        target?: {
            saveId?: number;
            boxId: number;
            boxSlots: number[];
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
            (moveTarget.saveId === saveId && moveTarget.boxId === boxId && moveTarget.boxSlots.includes(boxSlot))
            || (selected.saveId === saveId && !!pkmId && selected.ids.includes(pkmId))
        );
    },
    useClickable: (pkmIdsRaw: string[], saveId: number | undefined) => {
        const moveContext = StorageMoveContext.useValue();
        const selectContext = StorageSelectContext.useValue();

        const pkmIds = pkmIdsRaw.some(id => selectContext.hasPkm(saveId, id))
            ? selectContext.ids
            : pkmIdsRaw;

        const mainPkmsQuery = useStorageGetMainPkms();
        const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

        // const mainBoxesQuery = useStorageGetMainBoxes();
        // const saveBoxesQuery = useStorageGetSaveBoxes(saveId ?? 0);

        const pkmMains = !moveContext.selected && !saveId
            ? pkmIds.map(id => mainPkmsQuery.data?.data.find(pkm => pkm.id === id)).filter(filterIsDefined)
            : [];
        const pkmSaves = !moveContext.selected && !!saveId
            ? pkmIds.map(id => savePkmsQuery.data?.data.find(pkm => pkm.id === id)).filter(filterIsDefined)
            : [];

        // const boxMain = !moveContext.selected && storageType === 'main' ? mainBoxesQuery.data?.data.find(box => box.idInt === pkmMain?.boxId) : undefined;
        // const boxSave = !moveContext.selected && storageType === 'save' ? saveBoxesQuery.data?.data.find(box => box.idInt === pkmSave?.box) : undefined;

        const canClickIds = !saveId
            ? pkmMains.map(pkm => pkm.id)
            : pkmSaves.filter(pkmSave => pkmSave.canMove || pkmSave.canMoveToMain).map(pkm => pkm.id);

        const canClickAttachedIds = !saveId
            ? pkmMains.filter(pkmMain => pkmMain.canMoveAttachedToSave).map(pkm => pkm.id)
            : pkmSaves.filter(pkmSave => pkmSave?.canMoveAttachedToMain).map(pkm => pkm.id);

        return {
            onClick: canClickIds.length > 0
                ? (() => {
                    moveContext.setSelected({
                        ids: canClickIds,
                        saveId,
                    });
                })
                : undefined,
            onClickAttached: canClickAttachedIds.length > 0
                ? (() => {
                    moveContext.setSelected({
                        ids: canClickAttachedIds,
                        saveId,
                        attached: true,
                    });
                })
                : undefined,
        };
    },
    useDraggable: (pkmId: string, saveId: number | undefined) => {
        const ref = React.useRef<HTMLDivElement>(null);
        const { selected, setSelected } = StorageMoveContext.useValue();
        const selectContext = StorageSelectContext.useValue();

        const mainPkmsQuery = useStorageGetMainPkms();
        const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

        const sourcePkmMains = selected && !selected.saveId
            ? selected.ids.map(id => mainPkmsQuery.data?.data.find(pkm => pkm.id === id)).filter(filterIsDefined)
            : [];
        const sourcePkmSaves = selected && selected.saveId
            ? selected.ids.map(id => savePkmsQuery.data?.data.find(pkm => pkm.id === id)).filter(filterIsDefined)
            : [];

        const pkmMain = !selected && !saveId ? mainPkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;
        const pkmSave = !selected && !!saveId ? savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId) : undefined;

        const canClick = !saveId
            ? !!pkmMain
            : (pkmSave?.canMove || pkmSave?.canMoveToMain);

        React.useEffect(() => {
            const containerEl = document.body.querySelector(`#${StorageMoveContext.containerId}`) as HTMLDivElement;

            if (
                ref.current
                && !selected?.target
                && selected?.ids.includes(pkmId)
                && selected.saveId === saveId
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
                    setSelected(undefined);
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
        }, [ selected, pkmId, saveId, setSelected ]);

        let enablePointerMove = true;

        return {
            onPointerMove: canClick
                ? ((e: React.PointerEvent) => {
                    if (enablePointerMove && e.buttons === 1) {
                        const ids = selectContext.hasPkm(saveId, pkmId)
                            ? selectContext.ids
                            : [ pkmId ];

                        setSelected({
                            ids,
                            saveId,
                        });
                        enablePointerMove = false;
                    }
                })
                : undefined,
            renderItem: (element: React.ReactNode) => {

                if (selected?.ids.includes(pkmId) && selected.saveId === saveId) {
                    const allPkms = [ ...sourcePkmMains, ...sourcePkmSaves ];
                    const firstPkm = allPkms[ 0 ];
                    const selectedPkm = allPkms.find(pkm => pkm.id === pkmId);
                    const pkmSlot = selectedPkm!.boxSlot;
                    const pkmPos = [ pkmSlot % 6, ~~(pkmSlot / 6) ];
                    const firstPkmPos = [ firstPkm.boxSlot % 6, ~~(firstPkm.boxSlot / 6) ];
                    const posDiff = pkmPos.map((x, i) => x - firstPkmPos[ i ]);

                    return createPortal(<div
                        ref={ref}
                        style={{
                            position: 'absolute',
                            left: posDiff[ 0 ] * 102,
                            top: posDiff[ 1 ] * 102,
                            pointerEvents: 'none',
                        }}>
                        {element}
                    </div>, document.body.querySelector(`#${StorageMoveContext.containerId}`)!);
                }

                return element;
            },
        };
    },
    useDroppable: (saveId: number | undefined, dropBoxId: number, dropBoxSlot: number, pkmId?: string) => {
        const { t } = useTranslate();
        const { selected, setSelected } = StorageMoveContext.useValue();
        const selectContext = StorageSelectContext.useValue();

        const saveInfosQuery = useSaveInfosGetAll();

        const movePkmMutation = useStorageMovePkm();

        const mainBoxesQuery = useStorageGetMainBoxes();
        const targetSaveBoxesQuery = useStorageGetSaveBoxes(saveId ?? 0);

        const mainPkmsQuery = useStorageGetMainPkms();
        const mainPkmVersionsQuery = useStorageGetMainPkmVersions();
        const sourceSavePkmsQuery = useStorageGetSavePkms(selected?.saveId ?? 0);
        const targetSavePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

        const isDragging = !!selected && !selected.target;
        const isCurrentItemDragging = !!pkmId && selected && selected.ids.includes(pkmId) && selected.saveId === saveId;

        const sourceMainPkm = selected && selected.ids.length > 0 ? (
            selected.saveId
                ? sourceSavePkmsQuery.data?.data.find(pkm => pkm.id === selected.ids[ 0 ])
                : mainPkmsQuery.data?.data.find(pkm => pkm.id === selected.ids[ 0 ])
        ) : undefined;

        type SlotsInfos = {
            sourceId: string;
            sourceSlot: number;
            sourcePkmMain?: PkmDTO;
            sourcePkmSave?: PkmSaveDTO;
            targetSlot: number;
            targetPkmMain?: PkmDTO;
            targetPkmSave?: PkmSaveDTO;
        };

        const multipleSlotsInfos = selected?.ids.map((sourceId): SlotsInfos | undefined => {
            if (!sourceMainPkm) {
                return;
            }

            const sourcePkmMain = !selected.saveId ? mainPkmsQuery.data?.data.find(pkm => pkm.id === sourceId) : undefined;
            const sourcePkmSave = selected.saveId ? sourceSavePkmsQuery.data?.data.find(pkm => pkm.id === sourceId) : undefined;
            const sourcePkm = sourcePkmMain ?? sourcePkmSave;
            if (!sourcePkm) {
                return;
            }

            const sourceSlot = sourcePkm.boxSlot;
            const targetSlot = dropBoxSlot + (sourceSlot - sourceMainPkm.boxSlot);

            const targetPkmMain = !saveId ? mainPkmsQuery.data?.data.find(pkm => pkm.boxId === dropBoxId && pkm.boxSlot === targetSlot) : undefined;
            const targetPkmSave = saveId ? targetSavePkmsQuery.data?.data.find(pkm => pkm.boxId === dropBoxId && pkm.boxSlot === targetSlot) : undefined;

            if ((sourcePkmMain && targetPkmMain && sourcePkmMain.id === targetPkmMain.id)
                || (sourcePkmSave && targetPkmSave && sourcePkmSave.id === targetPkmSave.id)) {
                return;
            }

            return {
                sourceId,
                sourceSlot,
                sourcePkmMain,
                sourcePkmSave,
                targetSlot,
                targetPkmMain,
                targetPkmSave,
            };
        }).filter(filterIsDefined) ?? [];

        type ClickInfos = {
            enable: boolean;
            helpText?: string;
        };

        const getCanClick = (): ClickInfos => {

            const sourceSave = selected?.saveId ? saveInfosQuery.data?.data[ selected.saveId ] : undefined;
            const targetSave = saveId ? saveInfosQuery.data?.data[ saveId ] : undefined;

            const targetBoxMain = !saveId ? mainBoxesQuery.data?.data.find(box => box.idInt === dropBoxId) : undefined;
            const targetBoxSave = saveId ? targetSaveBoxesQuery.data?.data.find(box => box.idInt === dropBoxId) : undefined;

            const getPkmNickname = (id: string) => mainPkmVersionsQuery.data?.data.find(pkm => pkm.pkmId === id)?.nickname;

            const checkBetweenSlot = (
                targetBoxMain?: BoxDTO, targetBoxSave?: BoxDTO,
                targetPkmMain?: PkmDTO, targetPkmSave?: PkmSaveDTO,
                sourcePkmMain?: PkmDTO, sourcePkmSave?: PkmSaveDTO,
            ): ClickInfos => {
                const targetPkm = targetPkmMain ?? targetPkmSave;

                if (!isDragging) {
                    return { enable: false };
                }

                // if (!!targetPkm && selected.ids.includes(targetPkm.id)) {
                // return { enable: false, helpText: 'bar ' + targetPkm?.id + ' ' };
                // }

                if (selected.attached && targetPkm) {
                    return { enable: false, helpText: t('storage.move.attached-pkm') };
                }

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
                    const generation = targetPkmSave?.generation ?? targetSave?.generation;

                    if (!generation || !relatedPkmVersions.some(version => version.generation === generation)) {
                        return {
                            enable: false, helpText: t('storage.move.main-need-gen', { name: getPkmNickname(sourcePkmMain.id), generation })
                        };
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

            if (multipleSlotsInfos.length === 0) {
                return { enable: false };
            }

            if (multipleSlotsInfos.some(({ targetSlot }) => targetSlot < 0 || targetSlot > 29)) {
                return { enable: false };
            }

            for (const { targetPkmMain, targetPkmSave, sourcePkmMain, sourcePkmSave } of multipleSlotsInfos) {
                const result = checkBetweenSlot(
                    targetBoxMain, targetBoxSave,
                    targetPkmMain, targetPkmSave,
                    sourcePkmMain, sourcePkmSave
                );

                if (!result.enable) {
                    return result;
                }
            }

            return { enable: true };
        };

        const clickInfos = getCanClick();

        React.useEffect(() => {
            if (pkmId
                && selected?.ids.includes(pkmId)
                && selected.target
                && selected.target.saveId === saveId
                && selected.target.boxId === dropBoxId
                && selected.target.boxSlots.includes(dropBoxSlot)) {
                setSelected(undefined);
            }
        }, [ dropBoxId, dropBoxSlot, saveId, pkmId, selected, setSelected ]);

        const onDrop = async () => {
            if (!selected || multipleSlotsInfos.length === 0) {
                return;
            }

            const pkmIds = multipleSlotsInfos.map(slotsInfos => slotsInfos.sourceId);
            const targetBoxSlots = multipleSlotsInfos.map(slotsInfos => slotsInfos.targetSlot);

            setSelected({
                ...selected,
                target: {
                    saveId,
                    boxId: dropBoxId,
                    boxSlots: targetBoxSlots,
                },
            });

            // await new Promise(resolve => setTimeout(resolve, 3000));

            await movePkmMutation.mutateAsync({
                params: {
                    pkmIds,
                    sourceSaveId: selected.saveId,
                    targetSaveId: saveId,
                    targetBoxId: dropBoxId,
                    targetBoxSlots,
                    attached: selected.attached,
                }
            })
                .then(() => {
                    if (selectContext.hasPkm(selected.saveId, selected.ids[ 0 ])) {
                        selectContext.clear();
                    }
                })
                .finally(() => {
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
