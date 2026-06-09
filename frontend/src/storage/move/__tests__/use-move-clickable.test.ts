import { describe, expect, test } from 'vitest';
import { useDragging } from '../../../ui-new/interaction/move/hooks/use-dragging';
import { renderHookWithWrapper } from './utils/render-hook-with-wrapper';
import { setupTestDataServer } from './utils/setup-test-data-server';
import { containerFns, type MoveContainerValue, type MoveParams } from '../move-container-fns';

const useMoveClickable = ([ pkmId ]: [ string ], container: MoveContainerValue) => {
    const dragging = useDragging(pkmId, container);

    const dragMove = dragging.useDrag<MoveParams>({ attached: false });
    const dragMoveAttached = dragging.useDrag<MoveParams>({ attached: true });

    return {
        startDrag: dragMove.startDragByClick,
        startDragAttached: dragMoveAttached.startDragByClick,
        onPointerMove: dragging.onPointerDown,
        moveCount: dragMove.filteredIds.size,
        moveAttachedCount: dragMoveAttached.filteredIds.size,
    };
};

describe('use-move-clickable', () => {
    const server = setupTestDataServer();

    describe('pkm-variant clickable state', () => {
        test('should be clickable if is movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], {
                    type: 'main-item',
                    bankId: '',
                    saveId: null,
                    boxId: '0',
                }),
                {
                    initialState: {
                        status: 'idle',
                    },
                    onDrop: async () => { },
                }
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeDefined();
            expect(result.current.onPointerMove).toBeDefined();
            expect(result.current.moveCount).toBe(1);
        });

        test('should not be clickable if is not movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'cannotMove' ], {
                    type: 'main-item',
                    bankId: '',
                    saveId: null,
                    boxId: '',
                }),
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeUndefined();
            expect(result.current.onPointerMove).toBeUndefined();
            expect(result.current.moveCount).toBe(0);
        });

        test('should be clickable as attached if is movable as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], {
                    type: 'main-item',
                    bankId: '',
                    saveId: null,
                    boxId: '',
                }),
            );

            await waitForQueries();

            expect(result.current.startDragAttached).toBeDefined();
            expect(result.current.moveAttachedCount).toBe(1);
        });

        test('should use selected pkms if any', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], {
                    type: 'main-item',
                    bankId: '',
                    saveId: null,
                    boxId: '1',
                }),
                undefined,
                {
                    container: containerFns.getContainerHash({
                        type: 'main-item',
                        bankId: '',
                        saveId: null,
                        boxId: '1',
                    }),
                    ids: new Set([ 'canMove', 'canMove2' ]),
                }
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeDefined();
            expect(result.current.onPointerMove).toBeDefined();
            expect(result.current.moveCount).toBe(2);
        });
    });

    describe('pkm-save clickable state', () => {
        test('should be clickable if is movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], {
                    bankId: '',
                    saveId: 123,
                    boxId: '',
                    type: 'save-item',
                }),
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeDefined();
            expect(result.current.onPointerMove).toBeDefined();
            expect(result.current.moveCount).toBe(1);
        });

        test('should not be clickable if is not movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'cannotMove' ], {
                    bankId: '',
                    saveId: 123,
                    boxId: '',
                    type: 'save-item',
                }),
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeUndefined();
            expect(result.current.onPointerMove).toBeUndefined();
            expect(result.current.moveCount).toBe(0);
        });

        test('should be clickable as attached if is movable as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], {
                    bankId: '',
                    saveId: 123,
                    boxId: '',
                    type: 'save-item',
                }),
            );

            await waitForQueries();

            expect(result.current.startDragAttached).toBeDefined();
            expect(result.current.moveAttachedCount).toBe(1);
        });

        test('should not be clickable as attached if is not movable as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'cannotMove' ], {
                    bankId: '',
                    saveId: 123,
                    boxId: '',
                    type: 'save-item',
                }),
            );

            await waitForQueries();

            expect(result.current.startDragAttached).toBeUndefined();
            expect(result.current.moveAttachedCount).toBe(0);
        });
    });
});