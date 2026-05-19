import React from 'react';
import { createPortal } from 'react-dom';
import { useMoveContext } from '../context/use-move-context';

/**
 * Translate item rendering following given entity moving state.
 * If entity is not moving, do nothing.
 */
export const useDragging = function <C>(
    entityId: string,
    containerValue: C,
    getPortalPosition: (index: number) => [ number, number ],
) {
    const ref = React.useRef<HTMLDivElement>(null);
    const { moveContainerId, getContainerHash, useMoveStore } = useMoveContext<C>();

    const containerHash = getContainerHash(containerValue);

    const dispatch = useMoveStore(({ dispatch }) => dispatch);
    const isDragging = useMoveStore(({ state }) =>
        state.status === 'dragging'
        && state.source.containerId === containerHash
        && state.source.ids.has(entityId));

    React.useEffect(() => {
        const containerEl = document.body.querySelector(`#${moveContainerId}`) as HTMLDivElement;

        const getParents = (el: HTMLElement, parents: HTMLElement[] = []): HTMLElement[] => {
            if (!el.parentElement) {
                return parents;
            }
            return getParents(el.parentElement, [ ...parents, el.parentElement ]);
        };

        if (ref.current && isDragging) {
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
    }, [ dispatch, isDragging, moveContainerId ]);

    return {
        isDragging,
        renderDragItem: (element: React.ReactNode) => {
            if (isDragging) {
                const state = useMoveStore.getState().state;
                const ids = state.status === 'dragging'
                    ? [ ...state.source.ids ]
                    : [];

                const [ left, top ] = getPortalPosition(ids.indexOf(entityId));

                console.log('render-portal');

                return createPortal(
                    <div
                        ref={ref}
                        style={{
                            position: 'absolute',
                            left,
                            top,
                            pointerEvents: 'none',
                        }}
                    >
                        {element}
                    </div>,
                    document.body.querySelector(`#${moveContainerId}`)!,
                );
            }
        },
    };
};
