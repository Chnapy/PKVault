import { waitFor } from '@testing-library/dom';
import { describe, expect, test } from 'vitest';
import { getStorageMovePkmUrl } from '../../../data/sdk/storage/storage.gen';
import { renderHookWithWrapper } from '../__tests__/render-hook-with-wrapper';
import { setupTestDataServer } from '../__tests__/setup-test-data-server';
import type { MoveState } from '../state/move-state';
import type { DropRefusalReason } from '../validation/types';
import { useMoveDroppable } from './use-move-droppable';

describe('use-move-droppable', () => {
    const server = setupTestDataServer();

    describe('pkm-variant droppable state', () => {
        test('should not be droppable if not dragging', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 2, 2),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('not-dragging');
        });

        test('should not be droppable if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 2, 2),
                {
                    status: 'loading',
                    source: {
                        ids: [ 'canMove' ],
                    },
                    target: {
                        type: 'slot',
                        boxId: 1,
                        boxSlots: [ 1 ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('not-dragging');
        });

        test('should not be droppable if targeting moving pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 0),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('same-pkm-id');
        });

        test('should not be droppable if target slot out of bounds', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 29),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove', 'canMove2' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('out-of-bounds');
        });

        test('should not be droppable as attached if targeting pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 1),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                        attached: true,
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('attached-target-occupied');
        });

        test('should not be droppable to save if box cannot receive pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 2, 1),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('target-box-cannot-receive');
        });

        test('should not be droppable to main as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                        attached: true,
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('attached-main-to-main');
        });

        test('should not be droppable to save if version not compatible with save', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMoveNotCompatible' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-to-save-incompatible-version');
        });

        test('should not be droppable to save if can not move', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'cannotMoveToSave' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-cannot-move-to-save');
        });

        test('should not be droppable to save as attached if cannot move as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'cannotMoveAttachedToSave' ],
                        attached: true,
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-cannot-move-to-save');
        });

        test('should not be droppable to save if used variant is disabled', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'isDisabled' ],
                        attached: true,
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-disabled-to-save');
        });

        test('should not be droppable to save if no variant used and target pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(456, 0, 0),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-no-variant-to-save-occupied');
        });

        test('should not be droppable to save if already attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'isAttached' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-already-attached-to-save');
        });

        test('should not be droppable to main occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 2, 'cannotMove'),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('pkm-cannot-move');
        });

        test('should not be droppable to save occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 5, 'cannotMoveToMain'),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-cannot-move-main-to-main');
        });

        test('should be droppable to main', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
            expect(result.current.onPointerUp).toBe(result.current.onClick);

            let lastRequestUrl: string | undefined;

            server.events.on('request:start', ({ request }) => {
                lastRequestUrl = request.url;
            });

            const clickPromise = result.current.onClick!();
            rerender();

            expect(getMoveContext()).toEqual<MoveState>({
                status: 'loading',
                source: {
                    ids: [
                        'canMove',
                    ],
                },
                target: {
                    type: 'slot',
                    boxId: 0,
                    boxSlots: [ 10 ],
                    saveId: undefined,
                },
            });

            await clickPromise;
            await waitFor(() => expect(lastRequestUrl).toBeDefined());

            expect(lastRequestUrl).toBe('http://localhost:3000' + getStorageMovePkmUrl({
                pkmIds: [ 'canMove' ],
                targetBoxId: '0',
                targetBoxSlots: [ 10 ],
            }));

            rerender();

            expect(getMoveContext()).toEqual({
                status: 'idle',
            });
        });

        test('should be droppable to save', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
            expect(result.current.onPointerUp).toBe(result.current.onClick);

            let lastRequestUrl: string | undefined;

            server.events.on('request:start', ({ request }) => {
                lastRequestUrl = request.url;
            });

            const clickPromise = result.current.onClick!();
            rerender();

            expect(getMoveContext()).toEqual<MoveState>({
                status: 'loading',
                source: {
                    ids: [
                        'canMove',
                    ],
                },
                target: {
                    type: 'slot',
                    boxId: 0,
                    boxSlots: [ 10 ],
                    saveId: 123,
                },
            });

            await clickPromise;
            await waitFor(() => expect(lastRequestUrl).toBeDefined());

            expect(lastRequestUrl).toBe('http://localhost:3000' + getStorageMovePkmUrl({
                pkmIds: [ 'canMove' ],
                targetSaveId: 123,
                targetBoxId: '0',
                targetBoxSlots: [ 10 ],
            }));

            rerender();

            expect(getMoveContext()).toEqual({
                status: 'idle',
            });
        });

        test('should be droppable to save as attached', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                        attached: true,
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
            expect(result.current.onPointerUp).toBe(result.current.onClick);

            let lastRequestUrl: string | undefined;

            server.events.on('request:start', ({ request }) => {
                lastRequestUrl = request.url;
            });

            const clickPromise = result.current.onClick!();
            rerender();

            expect(getMoveContext()).toEqual<MoveState>({
                status: 'loading',
                source: {
                    attached: true,
                    ids: [
                        'canMove',
                    ],
                },
                target: {
                    type: 'slot',
                    boxId: 0,
                    boxSlots: [ 10 ],
                    saveId: 123,
                },
            });

            await clickPromise;
            await waitFor(() => expect(lastRequestUrl).toBeDefined());

            expect(lastRequestUrl).toBe('http://localhost:3000' + getStorageMovePkmUrl({
                pkmIds: [ 'canMove' ],
                targetSaveId: 123,
                targetBoxId: '0',
                targetBoxSlots: [ 10 ],
                attached: true,
            }));

            rerender();

            expect(getMoveContext()).toEqual({
                status: 'idle',
            });
        });

        test('should clear selected pkms if any', async () => {
            const { result, waitForQueries, getSelectContext, rerender } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                    }
                },
                {
                    ids: [ 'canMove', 'canMove2' ],
                    boxId: 1,
                },
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
            expect(result.current.onPointerUp).toBe(result.current.onClick);

            await result.current.onClick!();
            rerender();

            expect(getSelectContext()?.ids).toHaveLength(0);
        });
    });
    describe('pkm-save droppable state', () => {
        test('should not be droppable if not dragging', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 2, 2),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('not-dragging');
        });

        test('should not be droppable if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 2, 2),
                {
                    status: 'loading',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                    },
                    target: {
                        type: 'slot',
                        saveId: 123,
                        boxId: 1,
                        boxSlots: [ 1 ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('not-dragging');
        });

        test('should not be droppable if targeting moving pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 0),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('same-pkm-id');
        });

        test('should not be droppable if target slot out of bounds', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 29),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove', 'canMove2' ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('out-of-bounds');
        });

        test('should not be droppable as attached if targeting save', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                        attached: true,
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('attached-save-to-save');
        });

        test('should not be droppable to save if not movable to save', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(456, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'cannotMoveToSave' ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('pkm-save-cannot-move');
        });

        test('should not be droppable to save if target pkm not movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(789, 0, 1, 'cannotMove'),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-pkm-save-cannot-move');
        });

        test('should not be droppable to save if not same generation', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(456, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-save-not-same-generation');
        });

        test('should not be droppable to main if egg', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'egg' ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-egg-to-main');
        });

        test('should not be droppable to main if shadow', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'shadow' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-shadow-to-main');
        });

        test('should not be droppable to main if cannot move', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'cannotMoveToMain' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-cannot-move-main-to-main');
        });

        test('should not be droppable to main as attached if cannot move as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'cannotMoveAttachedToMain' ],
                        attached: true,
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-cannot-move-main-to-main');
        });

        test('should not be droppable to main if variant with same ID already exists', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'existID' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-main-variant-already-exist');
        });

        test('should not be droppable to main occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 7, 'cannotMoveToSave'),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-cannot-move-to-save');
        });

        test('should not be droppable to save occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable(123, 0, 8, 'cannotMove'),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-save-cannot-move');
        });

        test('should be droppable to save', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveDroppable(789, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
            expect(result.current.onPointerUp).toBe(result.current.onClick);

            let lastRequestUrl: string | undefined;

            server.events.on('request:start', ({ request }) => {
                lastRequestUrl = request.url;
            });

            const clickPromise = result.current.onClick!();
            rerender();

            expect(getMoveContext()).toEqual<MoveState>({
                status: 'loading',
                source: {
                    saveId: 123,
                    ids: [
                        'canMove',
                    ],
                },
                target: {
                    type: 'slot',
                    boxId: 0,
                    boxSlots: [ 10 ],
                    saveId: 789,
                },
            });

            await clickPromise;
            await waitFor(() => expect(lastRequestUrl).toBeDefined());

            expect(lastRequestUrl).toBe('http://localhost:3000' + getStorageMovePkmUrl({
                pkmIds: [ 'canMove' ],
                sourceSaveId: 123,
                targetSaveId: 789,
                targetBoxId: '0',
                targetBoxSlots: [ 10 ],
            }));

            rerender();

            expect(getMoveContext()).toEqual<MoveState>({
                status: 'idle',
            });
        });

        test('should be droppable to main', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                    }
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
            expect(result.current.onPointerUp).toBe(result.current.onClick);

            let lastRequestUrl: string | undefined;

            server.events.on('request:start', ({ request }) => {
                lastRequestUrl = request.url;
            });

            const clickPromise = result.current.onClick!();
            rerender();

            expect(getMoveContext()).toEqual<MoveState>({
                status: 'loading',
                source: {
                    saveId: 123,
                    ids: [
                        'canMove',
                    ],
                },
                target: {
                    type: 'slot',
                    boxId: 0,
                    boxSlots: [ 10 ],
                    saveId: undefined,
                },
            });

            await clickPromise;
            await waitFor(() => expect(lastRequestUrl).toBeDefined());

            expect(lastRequestUrl).toBe('http://localhost:3000' + getStorageMovePkmUrl({
                pkmIds: [ 'canMove' ],
                sourceSaveId: 123,
                targetBoxId: '0',
                targetBoxSlots: [ 10 ],
            }));

            rerender();

            expect(getMoveContext()).toEqual({
                status: 'idle',
            });
        });

        test('should be droppable to main as attached', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => useMoveDroppable(undefined, 0, 10),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                        attached: true,
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
            expect(result.current.onPointerUp).toBe(result.current.onClick);

            let lastRequestUrl: string | undefined;

            server.events.on('request:start', ({ request }) => {
                lastRequestUrl = request.url;
            });

            const clickPromise = result.current.onClick!();
            rerender();

            expect(getMoveContext()).toEqual<MoveState>({
                status: 'loading',
                source: {
                    saveId: 123,
                    attached: true,
                    ids: [
                        'canMove',
                    ],
                },
                target: {
                    type: 'slot',
                    boxId: 0,
                    boxSlots: [ 10 ],
                    saveId: undefined,
                },
            });

            await clickPromise;
            await waitFor(() => expect(lastRequestUrl).toBeDefined());

            expect(lastRequestUrl).toBe('http://localhost:3000' + getStorageMovePkmUrl({
                pkmIds: [ 'canMove' ],
                sourceSaveId: 123,
                targetBoxId: '0',
                targetBoxSlots: [ 10 ],
                attached: true,
            }));

            rerender();

            expect(getMoveContext()).toEqual({
                status: 'idle',
            });
        });
    });
});
