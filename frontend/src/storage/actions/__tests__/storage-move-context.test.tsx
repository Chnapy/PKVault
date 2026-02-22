import React from 'react';
import { describe, expect, test } from 'vitest';
import { StorageMoveContext } from '../storage-move-context';
import { renderHookWithWrapper } from './render-hook-with-wrapper';
import { setupTestDataServer } from './setup-test-data-server';

describe('storage-move-context', () => {
    const server = setupTestDataServer();

    test('initial context value', () => {
        const { result } = renderHookWithWrapper(StorageMoveContext.useValue);

        expect(result.current).toEqual<typeof result.current>({
            selected: undefined,
            setSelected: expect.any(Function)
        });
    });

    describe('pkm-variant clickable state', () => {
        test('should not be clickable if move already in progress', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useClickable([ 'canMove' ], undefined),
                {
                    ids: [ '123' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.moveCount).toBe(0);
        });

        test('should be clickable if is movable', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useClickable([ 'canMove' ], undefined),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
            expect(result.current.moveCount).toBe(1);

            result.current.onClick!();
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                ids: [ 'canMove' ],
                saveId: undefined,
            });
        });

        test('should not be clickable if is not movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useClickable([ 'cannotMove' ], undefined),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.moveCount).toBe(0);
        });

        test('should be clickable as attached if is movable as attached', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useClickable([ 'canMove' ], undefined),
            );

            await waitForQueries();

            expect(result.current.onClickAttached).toBeDefined();
            expect(result.current.moveAttachedCount).toBe(1);

            result.current.onClickAttached!();
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                ids: [ 'canMove' ],
                saveId: undefined,
                attached: true,
            });
        });

        test('should use selected pkms if any', async () => {
            const { result, waitForQueries, getMoveContext, getSelectContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useClickable([ 'canMove' ], undefined),
                undefined,
                {
                    ids: [ 'canMove', 'canMove2' ],
                    boxId: 1,
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
            expect(result.current.moveCount).toBe(2);

            result.current.onClick!();
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                ids: [ 'canMove', 'canMove2' ],
                saveId: undefined,
            });
        });
    });
    describe('pkm-save clickable state', () => {
        test('should not be clickable if move already in progress', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useClickable([ 'canMove' ], 123),
                {
                    saveId: 123,
                    ids: [ '123' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.moveCount).toBe(0);
        });

        test('should be clickable if is movable', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useClickable([ 'canMove' ], 123),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
            expect(result.current.moveCount).toBe(1);

            result.current.onClick!();
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                ids: [ 'canMove' ],
                saveId: 123,
            });
        });

        test('should not be clickable if is not movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useClickable([ 'cannotMove' ], 123),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.moveCount).toBe(0);
        });

        test('should be clickable as attached if is movable as attached', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useClickable([ 'canMove' ], 123),
            );

            await waitForQueries();

            expect(result.current.onClickAttached).toBeDefined();
            expect(result.current.moveAttachedCount).toBe(1);

            result.current.onClickAttached!();
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                ids: [ 'canMove' ],
                saveId: 123,
                attached: true,
            });
        });

        test('should not be clickable as attached if is not movable as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useClickable([ 'cannotMove' ], 123),
            );

            await waitForQueries();

            expect(result.current.onClickAttached).toBeUndefined();
            expect(result.current.moveAttachedCount).toBe(0);
        });
    });

    describe('pkm-variant loading state', () => {
        test('should not be loading if not move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useLoading(undefined, 2, 2),
                {
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current).toBeFalsy();
        });

        test('should be loading if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useLoading(undefined, 2, 2),
                {
                    ids: [ 'canMove' ],
                    target: {
                        boxId: 2,
                        boxSlots: [ 2 ]
                    },
                }
            );

            await waitForQueries();

            expect(result.current).toBeTruthy();
        });
    });
    describe('pkm-save loading state', () => {
        test('should not be loading if not move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useLoading(123, 2, 2),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current).toBeFalsy();
        });

        test('should be loading if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useLoading(123, 2, 2),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                    target: {
                        saveId: 123,
                        boxId: 2,
                        boxSlots: [ 2 ]
                    },
                }
            );

            await waitForQueries();

            expect(result.current).toBeTruthy();
        });
    });
    describe('bank loading state', () => {
        test('should not be loading if move submitting not with current bank', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useLoadingBank('1'),
                {
                    ids: [ 'canMove' ],
                    target: {
                        boxId: 2,
                        boxSlots: [ 2 ],
                        bankId: '2'
                    },
                }
            );

            await waitForQueries();

            expect(result.current).toBeFalsy();
        });

        test('should be loading if move submitting with current bank', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useLoadingBank('1'),
                {
                    ids: [ 'canMove' ],
                    target: {
                        boxId: 2,
                        boxSlots: [ 2 ],
                        bankId: '1'
                    },
                }
            );

            await waitForQueries();

            expect(result.current).toBeTruthy();
        });
    });

    describe('pkm-variant draggable state', () => {
        test('should not be draggable if move already in progress', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDraggable('canMove', undefined),
                {
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onPointerMove).toBeUndefined();
        });

        test('should be draggable if is movable', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDraggable('canMove', undefined),
            );

            await waitForQueries();

            expect(result.current.onPointerMove).toBeDefined();

            const event = new MouseEvent('mousemove', {
                buttons: 1,
            }) as unknown as React.PointerEvent;

            result.current.onPointerMove!(event);
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                ids: [ 'canMove' ],
                saveId: undefined,
            });
        });

        test('should not be draggable if is not movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDraggable('cannotMove', undefined),
            );

            await waitForQueries();

            expect(result.current.onPointerMove).toBeUndefined();
        });

        test('should use selected pkms if any', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDraggable('canMove', undefined),
                undefined,
                {
                    ids: [ 'canMove', 'cannotMove' ],
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
                ids: [ 'canMove', 'cannotMove' ],
                saveId: undefined,
            });
        });
    });
    describe('pkm-save draggable state', () => {
        test('should not be draggable if move already in progress', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDraggable('canMove', 123),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onPointerMove).toBeUndefined();
        });

        test('should be draggable if is movable', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDraggable('canMove', 123),
            );

            await waitForQueries();

            expect(result.current.onPointerMove).toBeDefined();

            const event = new MouseEvent('mousemove', {
                buttons: 1,
            }) as unknown as React.PointerEvent;

            result.current.onPointerMove!(event);
            rerender();

            expect(getMoveContext()).toEqual<ReturnType<typeof getMoveContext>>({
                ids: [ 'canMove' ],
                saveId: 123,
            });
        });

        test('should not be draggable if is not movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDraggable('cannotMove', 123),
            );

            await waitForQueries();

            expect(result.current.onPointerMove).toBeUndefined();
        });
    });
});
