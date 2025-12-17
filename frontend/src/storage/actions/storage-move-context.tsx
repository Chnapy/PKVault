import React from 'react';
import { createPortal } from 'react-dom';
import type { BoxDTO, PkmDTO, PkmSaveDTO } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetMainBoxes, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSaveBoxes, useStorageGetSavePkms, useStorageMovePkm, useStorageMovePkmBank } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { filterIsDefined } from '../../util/filter-is-defined';
import { StorageSelectContext } from './storage-select-context';

type Context = {
    selected?: {
        ids: string[];
        saveId?: number;
        attached?: boolean;
        target?: {
            bankId?: string;    // only for bank buttons
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
    useLoadingBank: (bankId: string) => {
        const { selected } = StorageMoveContext.useValue();

        const moveTarget = selected?.target;

        return moveTarget?.bankId === bankId;
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
            moveCount: canClickIds.length,
            onClick: canClickIds.length > 0
                ? (() => {
                    moveContext.setSelected({
                        ids: canClickIds,
                        saveId,
                    });
                })
                : undefined,
            moveAttachedCount: canClickAttachedIds.length,
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

            const getParents = (el: HTMLElement, parents: HTMLElement[] = []): HTMLElement[] => {
                if (!el.parentElement) {
                    return parents;
                }
                return getParents(el.parentElement, [ ...parents, el.parentElement ]);
            };

            if (
                ref.current
                && !selected?.target
                && selected?.ids.includes(pkmId)
                && selected.saveId === saveId
            ) {
                const allParents = getParents(ref.current);

                const rect = ref.current.parentElement!.getBoundingClientRect();
                const { transform } = ref.current.style;

                const scrollXBase = allParents.reduce((acc, el) => acc + el.scrollLeft, 0);
                const scrollYBase = allParents.reduce((acc, el) => acc + el.scrollTop, 0);

                const moveVariables = {
                    diffX: 0,
                    diffY: 0,
                    scrollX: 0,
                    scrollY: 0,
                };

                const getTransform = () => {
                    const x = moveVariables.diffX + moveVariables.scrollX - scrollXBase;
                    const y = moveVariables.diffY + moveVariables.scrollY - scrollYBase;
                    return `translate(${x}px, ${y}px)`;
                };

                const moveHandler = (ev: Pick<MouseEvent, 'clientX' | 'clientY'>) => {
                    if (ref.current) {
                        const scrollX = allParents.reduce((acc, el) => acc + el.scrollLeft, 0);
                        const scrollY = allParents.reduce((acc, el) => acc + el.scrollTop, 0);

                        moveVariables.diffX = ev.clientX - rect.x;
                        moveVariables.diffY = ev.clientY - rect.y;

                        moveVariables.scrollX = scrollX;
                        moveVariables.scrollY = scrollY;
                        ref.current.style.transform = getTransform();
                        // ref.current.style.pointerEvents = 'none';
                    }
                };

                const upHandler = () => {
                    setSelected(undefined);
                };

                const scrollHandler = (ev: Event) => {
                    if (ref.current && (ev.target as HTMLElement)?.getAttribute?.('data-move-root')) {
                        moveVariables.scrollX = (ev.target as HTMLElement).scrollLeft;
                        moveVariables.scrollY = (ev.target as HTMLElement).scrollTop;
                        ref.current.style.transform = getTransform();
                    }
                };

                containerEl.addEventListener('pointermove', moveHandler);
                document.addEventListener('pointerup', upHandler);
                document.addEventListener('scroll', scrollHandler, true);

                if (window.event instanceof PointerEvent
                    || window.event instanceof MouseEvent
                ) {
                    moveHandler(window.event);
                }

                return () => {
                    containerEl.removeEventListener('pointermove', moveHandler);
                    document.removeEventListener('pointerup', upHandler);
                    document.removeEventListener('scroll', scrollHandler, true);

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
                    const firstPkmPos = [ (firstPkm?.boxSlot ?? 0) % 6, ~~((firstPkm?.boxSlot ?? 0) / 6) ];
                    const posDiff = pkmPos.map((x, i) => x - firstPkmPos[ i ]!);

                    return createPortal(<div
                        ref={ref}
                        style={{
                            position: 'absolute',
                            left: posDiff[ 0 ]! * 102,
                            top: posDiff[ 1 ]! * 102,
                            pointerEvents: 'none',
                        }}>
                        {element}
                    </div>, document.body.querySelector(`#${StorageMoveContext.containerId}`)!);
                }

                return element;
            },
        };
    },
    useDroppableBank: (bankId: string) => {
        const { t } = useTranslate();
        const { selected, setSelected } = StorageMoveContext.useValue();
        const selectContext = StorageSelectContext.useValue();

        const mainBoxesQuery = useStorageGetMainBoxes();
        const mainPkmsQuery = useStorageGetMainPkms();
        const mainPkmVersionsQuery = useStorageGetMainPkmVersions();
        const sourceSavePkmsQuery = useStorageGetSavePkms(selected?.saveId ?? 0);

        const movePkmBankMutation = useStorageMovePkmBank();

        const isDragging = !!selected && !selected.target;

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
            sourceMainBox?: BoxDTO;
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
            const sourceMainBox = sourcePkmMain && mainBoxesQuery.data?.data.find(box => box.idInt === sourcePkmMain.boxId);

            if (sourceMainBox && sourceMainBox.bankId === bankId) {
                return;
            }

            return {
                sourceId,
                sourceSlot,
                sourcePkmMain,
                sourcePkmSave,
                sourceMainBox,
            };
        }).filter(filterIsDefined) ?? [];

        type ClickInfos = {
            enable: boolean;
            helpText?: string;
        };

        const getCanClick = (): ClickInfos => {
            const checkBetweenSlot = (
                sourceMainBox?: BoxDTO, sourcePkmSave?: PkmSaveDTO,
            ): ClickInfos => {
                if (!isDragging) {
                    return { enable: false };
                }

                if (sourceMainBox && sourceMainBox.bankId === bankId) {
                    return { enable: false };
                }

                // pkm save -> main
                else if (sourcePkmSave) {
                    if (sourcePkmSave.isEgg) {
                        return { enable: false, helpText: t('storage.move.save-egg') };
                    }

                    if (sourcePkmSave.isShadow) {
                        return { enable: false, helpText: t('storage.move.save-shadow') };
                    }

                    if (!(selected.attached ? sourcePkmSave.canMoveAttachedToMain : sourcePkmSave.canMoveToMain)) {
                        return {
                            enable: false, helpText: selected.attached
                                ? t('storage.move.pkm-cannot-attached', { name: sourcePkmSave.nickname })
                                : t('storage.move.pkm-cannot', { name: sourcePkmSave.nickname })
                        };
                    }

                    const existingStoredPkmVersion = mainPkmVersionsQuery.data?.data.find(pkm => pkm.id === sourcePkmSave.idBase);
                    const existingStoredPkm = existingStoredPkmVersion && mainPkmsQuery.data?.data.find(pkm => pkm.id === existingStoredPkmVersion.pkmId);
                    if (existingStoredPkm && existingStoredPkm.saveId !== sourcePkmSave.saveId) {
                        return {
                            enable: false,
                            helpText: t('storage.move.save-main-duplicate', { name: sourcePkmSave.nickname })
                        };
                    }
                }

                return { enable: true };
            };

            if (multipleSlotsInfos.length === 0) {
                return { enable: false };
            }

            for (const { sourceMainBox, sourcePkmSave, } of multipleSlotsInfos) {
                const result = checkBetweenSlot(
                    sourceMainBox, sourcePkmSave
                );

                if (!result.enable) {
                    return result;
                }
            }

            return { enable: true };
        };

        const clickInfos = getCanClick();

        const onDrop = async () => {
            if (!selected || multipleSlotsInfos.length === 0) {
                return;
            }

            const pkmIds = [ ...multipleSlotsInfos ]
                .sort((i1, i2) => i1.sourceSlot < i2.sourceSlot ? -1 : 1)
                .map(slotsInfos => slotsInfos.sourceId);

            setSelected({
                ...selected,
                target: {
                    bankId,
                    boxId: -1,      // unused
                    boxSlots: [],   // unused
                },
            });

            await movePkmBankMutation.mutateAsync({
                params: {
                    bankId,
                    pkmIds,
                    sourceSaveId: selected.saveId,
                    attached: selected.attached,
                }
            })
                .then(() => {
                    if (selected.ids[ 0 ] && selectContext.hasPkm(selected.saveId, selected.ids[ 0 ])) {
                        selectContext.clear();
                    }
                })
                // await new Promise(resolve => setTimeout(resolve, 3000))
                .finally(() => {
                    setSelected(undefined);
                });
        };

        return {
            isDragging,
            onClick: clickInfos.enable ? (async () => {
                await onDrop();
            }) : undefined,
            onPointerUp: clickInfos.enable ? (async () => {
                await onDrop();
            }) : undefined,
            helpText: clickInfos.helpText,
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

            const getMainPkmNickname = (id: string) => mainPkmVersionsQuery.data?.data.find(pkm => pkm.pkmId === id)?.nickname;

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
                    if (!targetBoxSave.canSaveReceivePkm) {
                        return { enable: false, helpText: t('storage.move.box-cannot', { name: targetBoxSave.name }) };
                    }
                }

                // * -> box main
                if (targetBoxMain) {
                    if (!targetBoxMain.canSaveReceivePkm) {
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

                    if (sourceSave && targetSave && sourceSave.id !== targetSave.id) {
                        if (!sourcePkmSave.canMoveToSave) {
                            return {
                                enable: false,
                                helpText: t('storage.move.pkm-cannot', { name: sourcePkmSave.nickname }),
                            };
                        }

                        if (targetPkmSave && !targetPkmSave.canMoveToSave) {
                            return {
                                enable: false,
                                helpText: t('storage.move.pkm-cannot', { name: targetPkmSave.nickname }),
                            };
                        }
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
                                ? t('storage.move.pkm-cannot-attached-already', { name: getMainPkmNickname(sourcePkmMain.id) })
                                : (selected.attached ? t('storage.move.pkm-cannot-attached', { name: getMainPkmNickname(sourcePkmMain.id) }) : t('storage.move.pkm-cannot', { name: getMainPkmNickname(sourcePkmMain.id) })),
                        };
                    }

                    const relatedPkmVersions = mainPkmVersionsQuery.data?.data.filter(version => version.pkmId === sourcePkmMain.id) ?? [];
                    const generation = targetPkmSave?.generation ?? targetSave?.generation;

                    if (!generation || !relatedPkmVersions.some(version => version.generation === generation)) {
                        return {
                            enable: false, helpText: t('storage.move.main-need-gen', { name: getMainPkmNickname(sourcePkmMain.id), generation })
                        };
                    }

                    if (!selected.attached) {
                        if (relatedPkmVersions.length > 1) {
                            return { enable: false, helpText: t('storage.move.attached-multiple-versions', { name: getMainPkmNickname(sourcePkmMain.id) }) };
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
                                ? t('storage.move.pkm-cannot-attached', { name: sourcePkmSave.nickname })
                                : t('storage.move.pkm-cannot', { name: sourcePkmSave.nickname })
                        };
                    }

                    const existingStoredPkmVersion = mainPkmVersionsQuery.data?.data.find(pkm => pkm.id === sourcePkmSave.idBase);
                    const existingStoredPkm = existingStoredPkmVersion && mainPkmsQuery.data?.data.find(pkm => pkm.id === existingStoredPkmVersion.pkmId);
                    if (existingStoredPkm && existingStoredPkm.saveId !== sourcePkmSave.saveId) {
                        return {
                            enable: false,
                            helpText: t('storage.move.save-main-duplicate', { name: sourcePkmSave.nickname })
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

            const slotCount = (targetBoxMain?.slotCount ?? targetBoxSave?.slotCount ?? 0) - 1;
            if (multipleSlotsInfos.some(({ targetSlot }) => targetSlot < 0 || targetSlot > slotCount)) {
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
                    if (selected.ids[ 0 ] && selectContext.hasPkm(selected.saveId, selected.ids[ 0 ])) {
                        selectContext.clear();
                    }
                })
                .finally(() => {
                    setSelected(undefined);
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
