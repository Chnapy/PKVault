import React from 'react';
import { createPortal } from 'react-dom';
import { usePkmSaveIndex } from '../../data/hooks/use-pkm-save-index';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import type { BoxDTO, PkmSaveDTO, PkmVariantDTO } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetBoxes, useStorageMovePkm, useStorageMovePkmBank } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { SizingUtil } from '../../ui/util/sizing-util';
import { filterIsDefined } from '../../util/filter-is-defined';
import { StorageSelectContext } from './storage-select-context';
import { css } from '@emotion/css';

type Context = {
    selected?: {
        ids: string[];
        saveId?: number;
        attached?: boolean;
        target?: {
            bankId?: string; // only for bank buttons
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

// TODO complete refacto using state machine, this part is too complex to maintain
/**
 * Manage pkms move action with all possible cases:
 * - one or multiple pkms selected
 * - move into current box or another box
 * - move between PKVault <-> save
 * - move between save A <-> save B
 * - move to another bank
 * - move as attached or not
 */
export const StorageMoveContext = {
    containerId: 'storage-move-container',
    Provider: ({ children }: React.PropsWithChildren) => {
        const [ value, setValue ] = React.useState<Context>({
            setSelected: selected =>
                setValue(context => ({
                    ...context,
                    selected,
                })),
        });

        return <context.Provider value={value}>{children}</context.Provider>;
    },
    useValue: () => React.useContext(context),
    /**
     * Move in process for given position and/or pkmId.
     */
    useLoading: (saveId: number | undefined, boxId: number, boxSlot: number, pkmId?: string) => {
        const { selected } = StorageMoveContext.useValue();

        const moveTarget = selected?.target;

        return (
            !!moveTarget &&
            ((moveTarget.saveId === saveId && moveTarget.boxId === boxId && moveTarget.boxSlots.includes(boxSlot)) ||
                (selected.saveId === saveId && !!pkmId && selected.ids.includes(pkmId)))
        );
    },
    /**
     * Move to given bank in process.
     */
    useLoadingBank: (bankId: string) => {
        const { selected } = StorageMoveContext.useValue();

        const moveTarget = selected?.target;

        return moveTarget?.bankId === bankId;
    },
    /**
     * Given pkms can be moved.
     */
    useClickable: (pkmIdsRaw: string[], saveId: number | undefined) => {
        const moveContext = StorageMoveContext.useValue();
        const selectContext = StorageSelectContext.useValue();

        const pkmIds = pkmIdsRaw.some(id => selectContext.hasPkm(saveId, id)) ? selectContext.ids : pkmIdsRaw;

        const mainPkmVariantsQuery = usePkmVariantIndex();
        const savePkmsQuery = usePkmSaveIndex(saveId ?? 0);

        const pkmMains = !moveContext.selected && !saveId ? pkmIds.map(id => mainPkmVariantsQuery.data?.data.byId[ id ]).filter(filterIsDefined) : [];
        const pkmSaves = !moveContext.selected && !!saveId ? pkmIds.map(id => savePkmsQuery.data?.data.byId[ id ]).filter(filterIsDefined) : [];

        const canClickIds = !saveId ? pkmMains.map(pkm => pkm.id) : pkmSaves.filter(pkmSave => pkmSave.canMove || pkmSave.canMoveToMain).map(pkm => pkm.id);

        const canClickAttachedIds = !saveId
            ? pkmMains.filter(pkmMain => pkmMain.canMoveAttachedToSave).map(pkm => pkm.id)
            : pkmSaves.filter(pkmSave => pkmSave.canMoveAttachedToMain).map(pkm => pkm.id);

        return {
            moveCount: canClickIds.length,
            onClick:
                canClickIds.length > 0
                    ? () => {
                        moveContext.setSelected({
                            ids: canClickIds,
                            saveId,
                        });
                    }
                    : undefined,
            moveAttachedCount: canClickAttachedIds.length,
            onClickAttached:
                canClickAttachedIds.length > 0
                    ? () => {
                        moveContext.setSelected({
                            ids: canClickAttachedIds,
                            saveId,
                            attached: true,
                        });
                    }
                    : undefined,
        };
    },
    /**
     * Translate item rendering following given pkm moving state.
     * If pkm is not moving, do nothing.
     */
    useDraggable: (pkmId: string, saveId: number | undefined) => {
        const ref = React.useRef<HTMLDivElement>(null);
        const { selected, setSelected } = StorageMoveContext.useValue();
        const selectContext = StorageSelectContext.useValue();

        const mainPkmsQuery = usePkmVariantIndex();
        const savePkmsQuery = usePkmSaveIndex(saveId ?? 0);

        const boxesQuery = useStorageGetBoxes({ saveId });

        const sourcePkmMains = selected && !selected.saveId ? selected.ids.map(id => mainPkmsQuery.data?.data.byId[ id ]).filter(filterIsDefined) : [];
        const sourcePkmSaves = selected && selected.saveId ? selected.ids.map(id => savePkmsQuery.data?.data.byId[ id ]).filter(filterIsDefined) : [];

        const pkmMain = !selected && !saveId ? mainPkmsQuery.data?.data.byId[ pkmId ] : undefined;
        const pkmSave = !selected && !!saveId ? savePkmsQuery.data?.data.byId[ pkmId ] : undefined;

        const canClick = !saveId ? !!pkmMain : pkmSave?.canMove || pkmSave?.canMoveToMain;

        React.useEffect(() => {
            const containerEl = document.body.querySelector(`#${StorageMoveContext.containerId}`) as HTMLDivElement;

            const getParents = (el: HTMLElement, parents: HTMLElement[] = []): HTMLElement[] => {
                if (!el.parentElement) {
                    return parents;
                }
                return getParents(el.parentElement, [ ...parents, el.parentElement ]);
            };

            if (ref.current && !selected?.target && selected?.ids.includes(pkmId) && selected.saveId === saveId) {
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

                if (window.event instanceof PointerEvent || window.event instanceof MouseEvent) {
                    moveHandler(window.event);
                }

                return () => {
                    containerEl.removeEventListener('pointermove', moveHandler);
                    document.removeEventListener('pointerup', upHandler);
                    document.removeEventListener('scroll', scrollHandler, true);

                    if (ref.current) {
                        ref.current.style.transform = transform;
                    }
                };
            }
        }, [ selected, pkmId, saveId, setSelected ]);

        let enablePointerMove = true;

        return {
            onPointerMove: canClick
                ? (e: React.PointerEvent) => {
                    if (enablePointerMove && e.buttons === 1) {
                        const ids = selectContext.hasPkm(saveId, pkmId) ? selectContext.ids : [ pkmId ];

                        setSelected({
                            ids,
                            saveId,
                        });
                        enablePointerMove = false;
                    }
                }
                : undefined,
            renderItem: (element: React.ReactNode) => {
                if (selected?.ids.includes(pkmId) && selected.saveId === saveId) {
                    const allPkms = [ ...sourcePkmMains, ...sourcePkmSaves ];
                    const firstPkm = allPkms[ 0 ];
                    const selectedPkm = allPkms.find(pkm => pkm.id === pkmId);

                    const boxSlotCount = boxesQuery.data?.data.find(box => box.idInt === firstPkm?.boxId)?.slotCount;
                    const nbrPkmsPerLine = SizingUtil.getItemsPerLine(boxSlotCount ?? -1);

                    const pkmSlot = selectedPkm!.boxSlot;
                    const pkmPos = [ pkmSlot % nbrPkmsPerLine, ~~(pkmSlot / nbrPkmsPerLine) ];
                    const firstPkmPos = [ (firstPkm?.boxSlot ?? 0) % nbrPkmsPerLine, ~~((firstPkm?.boxSlot ?? 0) / nbrPkmsPerLine) ];
                    const posDiff = pkmPos.map((x, i) => x - firstPkmPos[ i ]!);

                    return createPortal(
                        <div
                            ref={ref}
                            className={css({
                                position: 'absolute',
                                left: posDiff[ 0 ]! * 102,
                                top: posDiff[ 1 ]! * 102,
                                pointerEvents: 'none',
                            })}
                        >
                            {element}
                        </div>,
                        document.body.querySelector(`#${StorageMoveContext.containerId}`)!,
                    );
                }

                return element;
            },
        };
    },
    /**
     * Estimate if given bank can receive currently moving pkm.
     * If no moving pkm, do nothing.
     */
    useDroppableBank: (bankId: string) => {
        const { t } = useTranslate();
        const { selected, setSelected } = StorageMoveContext.useValue();
        const selectContext = StorageSelectContext.useValue();

        const mainBoxesQuery = useStorageGetBoxes();
        const mainPkmVariantsQuery = usePkmVariantIndex();
        const sourceSavePkmsQuery = usePkmSaveIndex(selected?.saveId ?? 0);

        const movePkmBankMutation = useStorageMovePkmBank();

        const isDragging = !!selected && !selected.target;

        const sourceMainPkm =
            selected && selected.ids.length > 0
                ? selected.saveId
                    ? sourceSavePkmsQuery.data?.data.byId[ selected.ids[ 0 ]! ]
                    : mainPkmVariantsQuery.data?.data.byId[ selected.ids[ 0 ]! ]
                : undefined;

        type SlotsInfos = {
            sourceId: string;
            sourceSlot: number;
            sourcePkmMain?: PkmVariantDTO;
            sourcePkmSave?: PkmSaveDTO;
            sourceMainBox?: BoxDTO;
        };

        const multipleSlotsInfos =
            selected?.ids
                .map((sourceId): SlotsInfos | undefined => {
                    if (!sourceMainPkm) {
                        return;
                    }

                    const sourcePkmMain = !selected.saveId ? mainPkmVariantsQuery.data?.data.byId[ sourceId ] : undefined;
                    const sourcePkmSave = selected.saveId ? sourceSavePkmsQuery.data?.data.byId[ sourceId ] : undefined;
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
                })
                .filter(filterIsDefined) ?? [];

        type ClickInfos = {
            enable: boolean;
            helpText?: string;
        };

        const getCanClick = (): ClickInfos => {
            const checkBetweenSlot = (sourceMainBox?: BoxDTO, sourcePkmSave?: PkmSaveDTO): ClickInfos => {
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
                            enable: false,
                            helpText: selected.attached
                                ? t('storage.move.pkm-cannot-attached', {
                                    name: sourcePkmSave.nickname,
                                })
                                : t('storage.move.pkm-cannot', {
                                    name: sourcePkmSave.nickname,
                                }),
                        };
                    }

                    const existingStoredPkmVariant = mainPkmVariantsQuery.data?.data.byId[ sourcePkmSave.idBase ];
                    if (existingStoredPkmVariant && existingStoredPkmVariant.attachedSaveId !== sourcePkmSave.saveId) {
                        return {
                            enable: false,
                            helpText: t('storage.move.save-main-duplicate', {
                                name: sourcePkmSave.nickname,
                            }),
                        };
                    }
                }

                return { enable: true };
            };

            if (multipleSlotsInfos.length === 0) {
                return { enable: false };
            }

            for (const { sourceMainBox, sourcePkmSave } of multipleSlotsInfos) {
                const result = checkBetweenSlot(sourceMainBox, sourcePkmSave);

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

            const pkmIds = [ ...multipleSlotsInfos ].sort((i1, i2) => (i1.sourceSlot < i2.sourceSlot ? -1 : 1)).map(slotsInfos => slotsInfos.sourceId);

            setSelected({
                ...selected,
                target: {
                    bankId,
                    boxId: -1, // unused
                    boxSlots: [], // unused
                },
            });

            await movePkmBankMutation
                .mutateAsync({
                    params: {
                        bankId,
                        pkmIds,
                        sourceSaveId: selected.saveId,
                        attached: selected.attached,
                    },
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
            onClick: clickInfos.enable
                ? async () => {
                    await onDrop();
                }
                : undefined,
            onPointerUp: clickInfos.enable
                ? async () => {
                    await onDrop();
                }
                : undefined,
            helpText: clickInfos.helpText,
        };
    },
    /**
     * Estimate if given position can receive currently moving pkm.
     * If no moving pkm, do nothing.
     */
    useDroppable: (saveId: number | undefined, dropBoxId: number, dropBoxSlot: number, pkmId?: string) => {
        const { t } = useTranslate();
        const { selected, setSelected } = StorageMoveContext.useValue();
        const selectContext = StorageSelectContext.useValue();

        const saveInfosQuery = useSaveInfosGetAll();

        const movePkmMutation = useStorageMovePkm();

        const boxesQuery = useStorageGetBoxes({ saveId });

        const mainPkmVariantsQuery = usePkmVariantIndex();
        const sourceSavePkmsQuery = usePkmSaveIndex(selected?.saveId ?? 0);
        const targetSavePkmsQuery = usePkmSaveIndex(saveId ?? 0);

        const isDragging = !!selected && !selected.target;
        const isCurrentItemDragging = !!pkmId && selected && selected.ids.includes(pkmId) && selected.saveId === saveId;

        const sourceMainPkm =
            selected && selected.ids.length > 0
                ? selected.saveId
                    ? sourceSavePkmsQuery.data?.data.byId[ selected.ids[ 0 ]! ]
                    : mainPkmVariantsQuery.data?.data.byId[ selected.ids[ 0 ]! ]
                : undefined;

        type SlotsInfos = {
            sourceId: string;
            sourceSlot: number;
            sourcePkmMain?: PkmVariantDTO;
            sourcePkmSave?: PkmSaveDTO;
            targetSlot: number;
            targetPkmMains: PkmVariantDTO[];
            targetPkmSave?: PkmSaveDTO;
        };

        const multipleSlotsInfos =
            selected?.ids
                .map((sourceId): SlotsInfos | undefined => {
                    if (!sourceMainPkm) {
                        return;
                    }

                    const sourcePkmMain = !selected.saveId ? mainPkmVariantsQuery.data?.data.byId[ sourceId ] : undefined;
                    const sourcePkmSave = selected.saveId ? sourceSavePkmsQuery.data?.data.byId[ sourceId ] : undefined;
                    const sourcePkm = sourcePkmMain ?? sourcePkmSave;
                    if (!sourcePkm) {
                        return;
                    }

                    const sourceSlot = sourcePkm.boxSlot;
                    const targetSlot = dropBoxSlot + (sourceSlot - sourceMainPkm.boxSlot);

                    const targetPkmMains = !saveId ? (mainPkmVariantsQuery.data?.data.byBox[ dropBoxId ]?.[ targetSlot ] ?? []) : [];
                    const targetPkmSave = saveId ? targetSavePkmsQuery.data?.data.byBox[ dropBoxId ]?.[ targetSlot ] : undefined;

                    if (
                        (sourcePkmMain && targetPkmMains.length > 0 && targetPkmMains.some(targetMain => sourcePkmMain.id === targetMain.id)) ||
                        (sourcePkmSave && targetPkmSave && sourcePkmSave.id === targetPkmSave.id)
                    ) {
                        return;
                    }

                    return {
                        sourceId,
                        sourceSlot,
                        sourcePkmMain,
                        sourcePkmSave,
                        targetSlot,
                        targetPkmMains,
                        targetPkmSave,
                    };
                })
                .filter(filterIsDefined) ?? [];

        type ClickInfos = {
            enable: boolean;
            helpText?: string;
        };

        const getCanClick = (): ClickInfos => {
            if (multipleSlotsInfos.length === 0) {
                return { enable: false };
            }

            const sourceSave = selected?.saveId ? saveInfosQuery.data?.data[ selected.saveId ] : undefined;
            const targetSave = saveId ? saveInfosQuery.data?.data[ saveId ] : undefined;

            const targetBox = boxesQuery.data?.data.find(box => box.idInt === dropBoxId);
            const targetBoxMain = !saveId ? targetBox : undefined;
            const targetBoxSave = saveId ? targetBox : undefined;

            const getMainPkmNickname = (id: string) => mainPkmVariantsQuery.data?.data.byId[ id ]?.nickname;

            const checkBetweenSlot = (
                targetBoxMain?: BoxDTO,
                targetBoxSave?: BoxDTO,
                targetPkmMain?: PkmVariantDTO,
                targetPkmSave?: PkmSaveDTO,
                sourcePkmMain?: PkmVariantDTO,
                sourcePkmSave?: PkmSaveDTO,
            ): ClickInfos => {
                const targetPkm = targetPkmMain ?? targetPkmSave;

                if (!isDragging) {
                    return { enable: false };
                }

                if (selected.attached && targetPkm) {
                    return { enable: false, helpText: t('storage.move.attached-pkm') };
                }

                // * -> box save
                if (targetBoxSave) {
                    if (!targetBoxSave.canSaveReceivePkm) {
                        return {
                            enable: false,
                            helpText: t('storage.move.box-cannot', {
                                name: targetBoxSave.name,
                            }),
                        };
                    }
                }

                // pkm main -> main
                if (sourcePkmMain && (targetBoxMain || targetPkmMain)) {
                    if (selected.attached) {
                        return {
                            enable: false,
                            helpText: t('storage.move.attached-main-self'),
                        };
                    }
                }

                // pkm save -> save
                else if (sourcePkmSave && (targetBoxSave || targetPkmSave)) {
                    if (selected.attached) {
                        return {
                            enable: false,
                            helpText: t('storage.move.attached-save-self'),
                        };
                    }

                    if (sourceSave && targetSave && sourceSave.id !== targetSave.id) {
                        if (!sourcePkmSave.canMoveToSave) {
                            return {
                                enable: false,
                                helpText: t('storage.move.pkm-cannot', {
                                    name: sourcePkmSave.nickname,
                                }),
                            };
                        }

                        if (targetPkmSave && !targetPkmSave.canMoveToSave) {
                            return {
                                enable: false,
                                helpText: t('storage.move.pkm-cannot', {
                                    name: targetPkmSave.nickname,
                                }),
                            };
                        }
                    }

                    if (sourceSave && targetSave && sourceSave.generation !== targetSave.generation) {
                        return {
                            enable: false,
                            helpText: t('storage.move.save-same-gen', {
                                generation: sourceSave.generation,
                            }),
                        };
                    }

                    if (targetPkmSave) {
                        if (!targetPkmSave.canMove) {
                            return {
                                enable: false,
                                helpText: t('storage.move.pkm-cannot', {
                                    name: targetPkmSave.nickname,
                                }),
                            };
                        }
                    }
                }

                // pkm main -> save
                else if (sourcePkmMain && (targetBoxSave || targetPkmSave)) {

                    const save = sourceSave ?? targetSave;
                    if (save && !sourcePkmMain.compatibleWithVersions.includes(save.version)) {
                        return {
                            enable: false,
                            helpText: t('storage.move.main-incompatible-version', {
                                name: sourcePkmMain.nickname
                            }),
                        };
                    }

                    if (!(selected.attached ? sourcePkmMain.canMoveAttachedToSave : sourcePkmMain.canMoveToSave)) {
                        return {
                            enable: false,
                            helpText: sourcePkmMain.attachedSaveId
                                ? t('storage.move.pkm-cannot-attached-already', {
                                    name: getMainPkmNickname(sourcePkmMain.id),
                                })
                                : selected.attached
                                    ? t('storage.move.pkm-cannot-attached', {
                                        name: getMainPkmNickname(sourcePkmMain.id),
                                    })
                                    : t('storage.move.pkm-cannot', {
                                        name: getMainPkmNickname(sourcePkmMain.id),
                                    }),
                        };
                    }

                    const relatedPkmVariants = mainPkmVariantsQuery.data?.data.byBox[ sourcePkmMain.boxId ]?.[ sourcePkmMain.boxSlot ] ?? [];
                    const generation = targetPkmSave?.generation ?? targetSave?.generation;

                    const basePkmVariant = relatedPkmVariants.find(variant => variant.generation === generation);
                    if (basePkmVariant && !basePkmVariant.isEnabled) {
                        return {
                            enable: false,
                            helpText: t('storage.move.main-disabled'),
                        };
                    }

                    if (!basePkmVariant && targetPkmSave) {
                        return {
                            enable: false,
                            helpText: t('storage.move.pkm-cannot-create-variant', {
                                name: sourcePkmMain.nickname,
                            }),
                        };
                    }

                    const attachedPkmVariant = relatedPkmVariants.find(variant => variant.attachedSaveId);
                    if (attachedPkmVariant) {
                        return {
                            enable: false,
                            helpText: t('storage.move.pkm-cannot-attached-already', {
                                name: sourcePkmMain.nickname,
                            }),
                        };
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
                            enable: false,
                            helpText: selected.attached
                                ? t('storage.move.pkm-cannot-attached', {
                                    name: sourcePkmSave.nickname,
                                })
                                : t('storage.move.pkm-cannot', {
                                    name: sourcePkmSave.nickname,
                                }),
                        };
                    }

                    const existingStoredPkmVariant = mainPkmVariantsQuery.data?.data.byId[ sourcePkmSave.idBase ];
                    if (existingStoredPkmVariant && existingStoredPkmVariant.attachedSaveId !== sourcePkmSave.saveId) {
                        return {
                            enable: false,
                            helpText: t('storage.move.save-main-duplicate', {
                                name: sourcePkmSave.nickname,
                            }),
                        };
                    }
                }

                if (targetBoxMain || targetBoxSave) {
                    if (targetPkmMain && sourcePkmMain) {
                        return checkBetweenSlot(undefined, undefined, sourcePkmMain, undefined, targetPkmMain, undefined);
                    }

                    if (targetPkmSave && sourcePkmSave) {
                        return checkBetweenSlot(undefined, undefined, undefined, sourcePkmSave, undefined, targetPkmSave);
                    }

                    if (targetPkmMain && sourcePkmSave) {
                        return checkBetweenSlot(undefined, undefined, undefined, sourcePkmSave, targetPkmMain, undefined);
                    }

                    if (targetPkmSave && sourcePkmMain) {
                        return checkBetweenSlot(undefined, undefined, sourcePkmMain, undefined, undefined, targetPkmSave);
                    }
                }

                return { enable: true };
            };

            const slotCount = (targetBox?.slotCount ?? 0) - 1;
            if (multipleSlotsInfos.some(({ targetSlot }) => targetSlot < 0 || targetSlot > slotCount)) {
                return { enable: false };
            }

            for (const { targetPkmMains, targetPkmSave, sourcePkmMain, sourcePkmSave } of multipleSlotsInfos) {
                const normalizedTargetPkmMains = targetPkmMains.length === 0 ? [ undefined ] : targetPkmMains;
                for (const targetPkmMain of normalizedTargetPkmMains) {
                    const result = checkBetweenSlot(targetBoxMain, targetBoxSave, targetPkmMain, targetPkmSave, sourcePkmMain, sourcePkmSave);

                    if (!result.enable) {
                        return result;
                    }
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

            await movePkmMutation
                .mutateAsync({
                    params: {
                        pkmIds,
                        sourceSaveId: selected.saveId,
                        targetSaveId: saveId,
                        targetBoxId: dropBoxId.toString(),
                        targetBoxSlots,
                        attached: selected.attached,
                    },
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
            onClick: clickInfos.enable
                ? async () => {
                    await onDrop();
                }
                : undefined,
            onPointerUp: clickInfos.enable
                ? async () => {
                    await onDrop();
                }
                : undefined,
            helpText: clickInfos.helpText,
        };
    },
};
