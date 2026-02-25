import { describe, expect, test } from 'vitest';
import { renderHookWithWrapper } from '../__tests__/render-hook-with-wrapper';
import { useMoveClickable } from './use-move-clickable';
import { setupTestDataServer } from '../__tests__/setup-test-data-server';

describe('use-move-clickable', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const server = setupTestDataServer();

    describe('pkm-variant clickable state', () => {
        test('should not be clickable if move already in progress', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], undefined),
                {
                    status: 'dragging',
                    source: {
                        ids: [ '123' ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeUndefined();
            expect(result.current.onPointerMove).toBeUndefined();
            expect(result.current.moveCount).toBe(0);
        });

        test('should be clickable if is movable', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], undefined),
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeDefined();
            expect(result.current.onPointerMove).toBeDefined();
            expect(result.current.moveCount).toBe(1);

            result.current.startDrag!();
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                status: 'dragging',
                source: {
                    ids: [ 'canMove' ],
                    saveId: undefined,
                },
            });
        });

        test('should not be clickable if is not movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'cannotMove' ], undefined),
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeUndefined();
            expect(result.current.onPointerMove).toBeUndefined();
            expect(result.current.moveCount).toBe(0);
        });

        test('should be clickable as attached if is movable as attached', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], undefined),
            );

            await waitForQueries();

            expect(result.current.startDragAttached).toBeDefined();
            expect(result.current.moveAttachedCount).toBe(1);

            result.current.startDragAttached!();
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                status: 'dragging',
                source: {
                    ids: [ 'canMove' ],
                    saveId: undefined,
                    attached: true,
                },
            });
        });

        test('should use selected pkms if any', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], undefined),
                undefined,
                {
                    ids: [ 'canMove', 'canMove2' ],
                    boxId: 1,
                }
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeDefined();
            expect(result.current.onPointerMove).toBeDefined();
            expect(result.current.moveCount).toBe(2);

            result.current.startDrag!();
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                status: 'dragging',
                source: {
                    ids: [ 'canMove', 'canMove2' ],
                    saveId: undefined,
                },
            });
        });
    });
    describe('pkm-save clickable state', () => {
        test('should not be clickable if move already in progress', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], 123),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ '123' ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeUndefined();
            expect(result.current.onPointerMove).toBeUndefined();
            expect(result.current.moveCount).toBe(0);
        });

        test('should be clickable if is movable', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], 123),
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeDefined();
            expect(result.current.onPointerMove).toBeDefined();
            expect(result.current.moveCount).toBe(1);

            result.current.startDrag!();
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                status: 'dragging',
                source: {
                    ids: [ 'canMove' ],
                    saveId: 123,
                },
            });
        });

        test('should not be clickable if is not movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'cannotMove' ], 123),
            );

            await waitForQueries();

            expect(result.current.startDrag).toBeUndefined();
            expect(result.current.onPointerMove).toBeUndefined();
            expect(result.current.moveCount).toBe(0);
        });

        test('should be clickable as attached if is movable as attached', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], 123),
            );

            await waitForQueries();

            expect(result.current.startDragAttached).toBeDefined();
            expect(result.current.moveAttachedCount).toBe(1);

            result.current.startDragAttached!();
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                status: 'dragging',
                source: {
                    ids: [ 'canMove' ],
                    saveId: 123,
                    attached: true,
                },
            });
        });

        test('should not be clickable as attached if is not movable as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveClickable([ 'cannotMove' ], 123),
            );

            await waitForQueries();

            expect(result.current.startDragAttached).toBeUndefined();
            expect(result.current.moveAttachedCount).toBe(0);
        });
    });

    describe('drag user-action', () => {
        test('should be draggable if pkm-variant is movable', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], undefined),
            );

            await waitForQueries();

            expect(result.current.onPointerMove).toBeDefined();

            const event = new MouseEvent('mousemove', {
                buttons: 1,
            }) as unknown as React.PointerEvent;

            result.current.onPointerMove!(event);
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                status: 'dragging',
                source: {
                    ids: [ 'canMove' ],
                    saveId: undefined,
                }
            });
        });

        test('should be draggable if pkm-save is movable', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], 123),
            );

            await waitForQueries();

            expect(result.current.onPointerMove).toBeDefined();

            const event = new MouseEvent('mousemove', {
                buttons: 1,
            }) as unknown as React.PointerEvent;

            result.current.onPointerMove!(event);
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                status: 'dragging',
                source: {
                    ids: [ 'canMove' ],
                    saveId: 123,
                }
            });
        });

        test('should use selected movable pkms if any', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveClickable([ 'canMove' ], undefined),
                undefined,
                {
                    ids: [ 'canMove', 'cannotMove', 'canMove2' ],
                    boxId: 1,
                }
            );

            await waitForQueries();

            expect(result.current.onPointerMove).toBeDefined();

            const event = new MouseEvent('mousemove', {
                buttons: 1,
            }) as unknown as React.PointerEvent;

            result.current.onPointerMove!(event);
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                status: 'dragging',
                source: {
                    ids: [ 'canMove', 'canMove2' ],
                    saveId: undefined,
                },
            });
        });
    });
});