import type { Vector2 } from '@use-gesture/react';
import React from 'react';
import { createPortal } from 'react-dom';
import { useMoveContext } from '../context/use-move-context';
import classes from './drag-render.module.css';

type DragRenderProps = {
    elementRef: React.RefObject<HTMLButtonElement | null>;
    children: React.ReactNode;
};

export const DragRender: React.FC<DragRenderProps> = ({ elementRef, children }) => {
    const { moveContainerId, useMoveStore, positionsRef } = useMoveContext();

    const dragRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        let rafId = -1;

        const translateElement = () => {
            if (!dragRef.current || !elementRef.current) return;

            const state = useMoveStore.getState().state;

            if (state.status !== 'dragging') {
                if (dragRef.current.style.transform)
                    dragRef.current.style.transform = '';
                return;
            }

            const { scroll, pointer, pointerInitial, target, drag } = positionsRef.current;

            const elementBounds = elementRef.current.getBoundingClientRect();

            const element: Vector2 = [
                elementBounds.left,
                elementBounds.top,
            ];

            const baseDiff: Vector2 = [
                element[ 0 ] - target[ 0 ],
                element[ 1 ] - target[ 1 ],
            ];

            const pointerDiff: Vector2 = state.trigger === 'click'
                ? [
                    pointer[ 0 ] - pointerInitial[ 0 ],
                    pointer[ 1 ] - pointerInitial[ 1 ],
                ]
                : [ 0, 0 ];

            const scrollDiff: Vector2 = state.trigger === 'focus'
                ? [ 0, 0 ]
                : scroll;

            const position = [
                baseDiff[ 0 ] + drag[ 0 ] + pointerDiff[ 0 ] + scrollDiff[ 0 ],
                baseDiff[ 1 ] + drag[ 1 ] + pointerDiff[ 1 ] + scrollDiff[ 1 ],
            ];

            const [ x, y ] = position;
            const transform = `translate(${x!.toFixed()}px, ${y!.toFixed()}px)`;

            if (transform !== dragRef.current.style.transform)
                dragRef.current.style.transform = transform;

            rafId = requestAnimationFrame(translateElement);
        };

        rafId = requestAnimationFrame(translateElement);

        return () => {
            cancelAnimationFrame(rafId);
        };
    }, [ positionsRef, elementRef, useMoveStore ]);

    // console.log('render-portal');

    return createPortal(
        <div
            ref={dragRef}
            className={classes.dragRender}
        >
            {children}
        </div>,
        document.body.querySelector(`#${moveContainerId}`)!,
    );
};
