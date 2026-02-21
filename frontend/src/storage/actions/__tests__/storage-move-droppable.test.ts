import { waitFor } from '@testing-library/dom';
import { describe, test, expect } from 'vitest';
import { getStorageMovePkmUrl, getStorageMovePkmBankUrl } from '../../../data/sdk/storage/storage.gen';
import { StorageMoveContext, type StorageMoveContextValue } from '../storage-move-context';
import { renderHookWithWrapper } from './render-hook-with-wrapper';
import { setupTestDataServer } from './setup-test-data-server';

describe('storage-move droppable state', () => {
    const server = setupTestDataServer();

    describe('pkm-variant droppable state', () => {
        test('should not be droppable if not dragging', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 2, 2),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            // expect(result.current._disabledType).toBe('empty-slot-infos');
        });

        test('should not be droppable if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 2, 2),
                {
                    ids: [ 'canMove' ],
                    target: {
                        boxId: 1,
                        boxSlots: [ 1 ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('not-dragging');
        });

        test('should not be droppable if targeting moving pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 0),
                {
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            // expect(result.current._disabledType).toBe('empty-slot-infos');
        });

        test('should not be droppable if target slot out of bounds', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 29),
                {
                    ids: [ 'canMove', 'canMove2' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('out-of-bounds');
        });

        test('should not be droppable as attached if targeting pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 1),
                {
                    ids: [ 'canMove' ],
                    attached: true,
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('attached-target-occupied');
        });

        test('should not be droppable to save if box cannot receive pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 2, 1),
                {
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('target-box-cannot-receive');
        });

        test('should not be droppable to main as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 10),
                {
                    ids: [ 'canMove' ],
                    attached: true,
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('attached-main-to-main');
        });

        test('should not be droppable to save if version not compatible with save', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 10),
                {
                    ids: [ 'canMoveNotCompatible' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('main-to-save-incompatible-version');
        });

        test('should not be droppable to save if can not move', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 10),
                {
                    ids: [ 'cannotMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('main-cannot-move-to-save');
        });

        test('should not be droppable to save as attached if cannot move as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 10),
                {
                    ids: [ 'cannotMove' ],
                    attached: true,
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('main-cannot-move-to-save');
        });

        test('should not be droppable to save if used variant is disabled', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 10),
                {
                    ids: [ 'isDisabled' ],
                    attached: true,
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('main-disabled-to-save');
        });

        test('should not be droppable to save if no variant used and target pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(456, 0, 0),
                {
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('main-no-variant-to-save-occupied');
        });

        test('should not be droppable to save if already attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 10),
                {
                    ids: [ 'isAttached' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('main-already-attached-to-save');
        });

        test('should not be droppable to main occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 2, 'cannotMove'),
                {
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('pkm-cannot-move');
        });

        test('should not be droppable to save occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 0, 'cannotMove'),
                {
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-cannot-move-main-to-main');
        });

        test('should be droppable to main', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 10),
                {
                    ids: [ 'canMove' ],
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

            expect(getMoveContext()).toEqual<StorageMoveContextValue>({
                ids: [
                    'canMove',
                ],
                target: {
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

            expect(getMoveContext()).toBeUndefined();
        });

        test('should be droppable to save', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 10),
                {
                    ids: [ 'canMove' ],
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

            expect(getMoveContext()).toEqual<StorageMoveContextValue>({
                ids: [
                    'canMove',
                ],
                target: {
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

            expect(getMoveContext()).toBeUndefined();
        });

        test('should be droppable to save as attached', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 10),
                {
                    ids: [ 'canMove' ],
                    attached: true,
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

            expect(getMoveContext()).toEqual<StorageMoveContextValue>({
                attached: true,
                ids: [
                    'canMove',
                ],
                target: {
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

            expect(getMoveContext()).toBeUndefined();
        });

        test('should clear selected pkms if any', async () => {
            const { result, waitForQueries, getSelectContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 10),
                {
                    ids: [ 'canMove' ],
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
                () => StorageMoveContext.useDroppable(123, 2, 2),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            // expect(result.current._disabledType).toBe('empty-slot-infos');
        });

        test('should not be droppable if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 2, 2),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                    target: {
                        saveId: 123,
                        boxId: 1,
                        boxSlots: [ 1 ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('not-dragging');
        });

        test('should not be droppable if targeting moving pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 0),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            // expect(result.current._disabledType).toBe('empty-slot-infos');
        });

        test('should not be droppable if target slot out of bounds', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 29),
                {
                    saveId: 123,
                    ids: [ 'canMove', 'canMove2' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('out-of-bounds');
        });

        test('should not be droppable as attached if targeting save', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                    attached: true,
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('attached-save-to-save');
        });

        test('should not be droppable to save if not movable to save', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(456, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'cannotMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('pkm-save-cannot-move');
        });

        test('should not be droppable to save if target pkm not movable', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(789, 0, 1, 'cannotMove'),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-to-pkm-save-cannot-move');
        });

        test('should not be droppable to save if not same generation', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(456, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-to-save-not-same-generation');
        });

        test('should not be droppable to main if egg', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'egg' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-egg-to-main');
        });

        test('should not be droppable to main if shadow', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'shadow' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-shadow-to-main');
        });

        test('should not be droppable to main if cannot move', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'cannotMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-cannot-move-main-to-main');
        });

        test('should not be droppable to main as attached if cannot move as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'cannotMove' ],
                    attached: true,
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-cannot-move-main-to-main');
        });

        test('should not be droppable to main if variant with same ID already exists', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'existID' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-to-main-variant-already-exist');
        });

        test('should not be droppable to main occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 2, 'cannotMove'),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('main-cannot-move-to-save');
        });

        test('should not be droppable to save occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(123, 0, 0, 'cannotMove'),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-to-save-cannot-move');
        });

        test('should be droppable to save', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(789, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
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

            expect(getMoveContext()).toEqual<StorageMoveContextValue>({
                saveId: 123,
                ids: [
                    'canMove',
                ],
                target: {
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

            expect(getMoveContext()).toBeUndefined();
        });

        test('should be droppable to main', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
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

            expect(getMoveContext()).toEqual<StorageMoveContextValue>({
                saveId: 123,
                ids: [
                    'canMove',
                ],
                target: {
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

            expect(getMoveContext()).toBeUndefined();
        });

        test('should be droppable to main as attached', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppable(undefined, 0, 10),
                {
                    saveId: 123,
                    ids: [ 'canMove' ],
                    attached: true,
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

            expect(getMoveContext()).toEqual<StorageMoveContextValue>({
                saveId: 123,
                attached: true,
                ids: [
                    'canMove',
                ],
                target: {
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

            expect(getMoveContext()).toBeUndefined();
        });
    });
    describe('bank droppable state', () => {
        test('should not be droppable if not dragging', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('1'),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            // expect(result.current._disabledType).toBe('empty-slot-infos');
        });

        test('should not be droppable if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('1'),
                {
                    ids: [ 'canMove' ],
                    target: {
                        boxId: 1,
                        boxSlots: [ 1 ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('not-dragging');
        });

        test('should not be droppable if same bank', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('0'),
                {
                    ids: [ 'canMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            // expect(result.current._disabledType).toBe('empty-slot-infos');
        });

        test('should not be droppable if egg', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('1'),
                {
                    saveId: 123,
                    ids: [ 'egg' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-egg-to-main');
        });

        test('should not be droppable to main if shadow', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('1'),
                {
                    saveId: 123,
                    ids: [ 'shadow' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-shadow-to-main');
        });

        test('should not be droppable to main if cannot move', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('1'),
                {
                    saveId: 123,
                    ids: [ 'cannotMove' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-cannot-move-main-to-main');
        });

        test('should not be droppable to main as attached if cannot move as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('1'),
                {
                    saveId: 123,
                    ids: [ 'cannotMove' ],
                    attached: true,
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-cannot-move-main-to-main');
        });

        test('should not be droppable to main if variant with same ID already exists', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('1'),
                {
                    saveId: 123,
                    ids: [ 'existID' ],
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledType).toBe('save-to-main-variant-already-exist');
        });

        test('should be droppable', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('1'),
                {
                    ids: [ 'canMove' ],
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

            expect(getMoveContext()).toEqual<StorageMoveContextValue>({
                ids: [
                    'canMove',
                ],
                target: {
                    bankId: '1',
                    boxId: -1,
                    boxSlots: [],
                    saveId: undefined,
                },
            });

            await clickPromise;
            await waitFor(() => expect(lastRequestUrl).toBeDefined());

            expect(lastRequestUrl).toBe('http://localhost:3000' + getStorageMovePkmBankUrl({
                bankId: '1',
                pkmIds: [ 'canMove' ],
            }));

            rerender();

            expect(getMoveContext()).toBeUndefined();
        });

        test('should be droppable as attached', async () => {
            const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('1'),
                {
                    ids: [ 'canMove' ],
                    attached: true,
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

            expect(getMoveContext()).toEqual<StorageMoveContextValue>({
                attached: true,
                ids: [
                    'canMove',
                ],
                target: {
                    bankId: '1',
                    boxId: -1,
                    boxSlots: [],
                },
            });

            await clickPromise;
            await waitFor(() => expect(lastRequestUrl).toBeDefined());

            expect(lastRequestUrl).toBe('http://localhost:3000' + getStorageMovePkmBankUrl({
                bankId: '1',
                pkmIds: [ 'canMove' ],
                attached: true,
            }));

            rerender();

            expect(getMoveContext()).toBeUndefined();
        });

        test('should clear selected pkms if any', async () => {
            const { result, waitForQueries, getSelectContext, rerender } = renderHookWithWrapper(
                () => StorageMoveContext.useDroppableBank('1'),
                {
                    ids: [ 'canMove' ],
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
});
