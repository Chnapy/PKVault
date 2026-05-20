import type { Vector2 } from '@use-gesture/react';
import React from 'react';
import { createPortal } from 'react-dom';
import type { MoveStore } from '../../context/move-context';
import { useMoveContext } from '../../context/use-move-context';

export const useDragRender = (ref: React.RefObject<HTMLButtonElement | null>, isDragging: boolean) => {
    const { moveContainerId, useMoveStore } = useMoveContext();

    const dragRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isDragging) {
            let rafId = -1;

            const storeListener = ({ state }: MoveStore) => {
                if (!dragRef.current || !ref.current) return;

                if (state.status !== 'dragging') {
                    if (dragRef.current.style.transform)
                        dragRef.current.style.transform = '';
                    return;
                }

                const basePos: Vector2 = [
                    ref.current.offsetLeft,
                    ref.current.offsetTop,
                ];

                const baseDiff: Vector2 = [
                    basePos[ 0 ] - state.basePosition[ 0 ],
                    basePos[ 1 ] - state.basePosition[ 1 ],
                ];

                const pointerDiff: Vector2 = [
                    state.pointerPosition[ 0 ] - state.pointerInitialPosition[ 0 ],
                    state.pointerPosition[ 1 ] - state.pointerInitialPosition[ 1 ],
                ];

                const scrollDiff: Vector2 = [
                    state.scrollPosition[ 0 ],
                    state.scrollPosition[ 1 ],
                ];

                const position = [
                    state.position[ 0 ] + baseDiff[ 0 ] + pointerDiff[ 0 ] + scrollDiff[ 0 ],
                    state.position[ 1 ] + baseDiff[ 1 ] + pointerDiff[ 1 ] + scrollDiff[ 1 ],
                ];

                const [ x, y ] = position;
                const transform = `translate(${x}px, ${y}px)`;

                cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    if (dragRef.current)
                        dragRef.current.style.transform = transform;
                });
            };

            const unsubscribeStore = useMoveStore.subscribe(storeListener);

            storeListener(useMoveStore.getState());

            return () => {
                unsubscribeStore();
                cancelAnimationFrame(rafId);
            };
        }
    }, [ isDragging, ref, useMoveStore ]);

    return (children: React.ReactNode) => {
        if (!isDragging)
            return null;

        // console.log('render-portal');

        return createPortal(
            <div
                ref={dragRef}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    pointerEvents: 'none',
                }}
            >
                {children}
            </div>,
            document.body.querySelector(`#${moveContainerId}`)!,
        );
    };
};
