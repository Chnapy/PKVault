import { createPortal } from 'react-dom';
import { SizingUtil } from '../../../ui/util/sizing-util';
import React from 'react';
import { MoveContext } from '../context/move-context';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { usePkmSaveIndex } from '../../../data/hooks/use-pkm-save-index';
import { useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { css } from '@emotion/css';

/**
 * Translate item rendering following given pkm moving state.
 * If pkm is not moving, do nothing.
 */
export const useMoveDragging = (pkmId: string, saveId: number | undefined) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const { state, dispatch } = MoveContext.useValue();

    const mainPkmsQuery = usePkmVariantIndex();
    const savePkmsQuery = usePkmSaveIndex(saveId ?? 0);

    const boxesQuery = useStorageGetBoxes({ saveId });

    const sourcePkmMains = state.status === 'dragging' && !state.source.saveId
        ? state.source.ids.map(id => mainPkmsQuery.data?.data.byId[ id ]).filter(filterIsDefined)
        : [];
    const sourcePkmSaves = state.status === 'dragging' && state.source.saveId
        ? state.source.ids.map(id => savePkmsQuery.data?.data.byId[ id ]).filter(filterIsDefined)
        : [];

    React.useEffect(() => {
        const containerEl = document.body.querySelector(`#${MoveContext.containerId}`) as HTMLDivElement;

        const getParents = (el: HTMLElement, parents: HTMLElement[] = []): HTMLElement[] => {
            if (!el.parentElement) {
                return parents;
            }
            return getParents(el.parentElement, [ ...parents, el.parentElement ]);
        };

        if (ref.current && state.status === 'dragging' && state.source.ids.includes(pkmId) && state.source.saveId === saveId) {
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
                dispatch({ type: 'CANCEL' });
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
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                    ref.current.style.transform = transform;
                }
            };
        }
    }, [ state, dispatch, pkmId, saveId ]);

    return {
        renderItem: (element: React.ReactNode) => {
            if (state.status === 'dragging'
                && state.source.ids.includes(pkmId) && state.source.saveId === saveId) {
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
                    document.body.querySelector(`#${MoveContext.containerId}`)!,
                );
            }

            return element;
        },
    };
};
