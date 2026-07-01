import { describe, expect, test } from 'vitest';
import type { DropRefusalReason } from '../validation/types';
import { renderDroppable } from './utils/render-droppable';
import { setupTestDataServer } from './utils/setup-test-data-server';

describe('use-move-droppable', () => {
    const _server = setupTestDataServer();

    describe('pkm-variant droppable state', () => {
        test('should not be droppable if not dragging', async () => {
            const { result } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '2',
                    },
                    slot: 2,
                },
            });

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
        });

        test('should not be droppable if move submitting', async () => {
            const { result } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '2',
                    },
                    slot: 2,
                },
                initialState: 'loading',
            });

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
        });

        test('should not be droppable if targeting moving pkm', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 0,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current.canDrop).toBe(false);
            expect(result.current._disabledReason).toBe<DropRefusalReason>('same-pkm-id');
        });

        test('should not be droppable if target slot out of bounds', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove', 'canMove2' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 29,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('out-of-bounds');
        });

        test('should not be droppable as attached if targeting pkm', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 1,
                },
            });

            result.current.dragMoveAttached.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('attached-target-occupied');
        });

        test('should not be droppable to save if box cannot receive pkm', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '2',
                    },
                    slot: 1,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('target-box-cannot-receive');
        });

        test('should not be droppable to main as attached', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMoveAttached.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('attached-main-to-main');
        });

        test('should not be droppable to save if version not compatible with save', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMoveNotCompatible' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-to-save-incompatible-version');
        });

        test('should not be droppable to save if can not move', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'cannotMoveToSave' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-cannot-move-to-save');
        });

        test('should not be droppable to save as attached if cannot move as attached', async () => {
            const { result } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'cannotMoveAttachedToSave' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            expect(result.current.dragMoveAttached.enabled).toBeFalsy();
            expect(result.current.dragMoveAttached.startDragByClick).toBeUndefined();
            expect(result.current.dragMoveAttached.startDragByFocus).toBeUndefined();
        });

        test('should not be droppable to save if used variant is disabled', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'isDisabled' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMoveAttached.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-disabled-to-save');
        });

        test('should not be droppable to save if no variant used and target pkm', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 456,
                        boxId: '0',
                    },
                    slot: 0,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-no-variant-to-save-occupied');
        });

        test('should not be droppable to save if already attached', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'isAttached' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-already-attached-to-save');
        });

        test('should not be droppable to main occupied by not movable pkm', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 2,
                    id: 'cannotMove',
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('pkm-cannot-move');
        });

        test('should not be droppable to save occupied by not movable pkm', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 5,
                    id: 'cannotMoveToMain',
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-cannot-move-main-to-main');
        });

        test('should be droppable to main', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });

        test('should be droppable to save', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });

        test('should be droppable to save as attached', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMoveAttached.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });

        // TODO this test does not check selection
        test('should clear selected pkms if any', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '1',
                    },
                    ids: [ 'canMove', 'canMove2' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });
    });

    describe('pkm-save droppable state', () => {
        test('should not be droppable if not dragging', async () => {
            const { result } = await renderDroppable({
                source: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '2',
                    },
                    slot: 2,
                },
            });

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
        });

        test('should not be droppable if move submitting', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '2',
                    },
                    slot: 2,
                },
                initialState: 'loading',
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
        });

        test('should not be droppable if targeting moving pkm', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 0,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('same-pkm-id');
        });

        test('should not be droppable if target slot out of bounds', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove', 'canMove2' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 29,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('out-of-bounds');
        });

        test('should not be droppable as attached if targeting save', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMoveAttached.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('attached-save-to-save');
        });

        test('should not be droppable to save if not movable to save', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'cannotMoveToSave' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 456,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('pkm-save-cannot-move');
        });

        test('should not be droppable to save if target pkm not movable', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 789,
                        boxId: '0',
                    },
                    slot: 1,
                    id: 'cannotMove',
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-pkm-save-cannot-move');
        });

        test('should not be droppable to save if not same context', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 456,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-save-not-same-context');
        });

        test('should not be droppable to main if egg', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'egg' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-egg-to-main');
        });

        test('should not be droppable to main if shadow', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'shadow' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-shadow-to-main');
        });

        test('should not be droppable to main if cannot move', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'cannotMoveToMain' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-cannot-move-main-to-main');
        });

        test('should not be droppable to main as attached if cannot move as attached', async () => {
            const { result } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'cannotMoveAttachedToMain' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            expect(result.current.dragMoveAttached.enabled).toBeFalsy();
        });

        test('should not be droppable to main if variant with same ID already exists', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'existID' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-main-variant-already-exist');
        });

        test('should not be droppable to main occupied by not movable pkm', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 7,
                    id: 'cannotMoveToSave',
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-cannot-move-to-save');
        });

        test('should not be droppable to save occupied by not movable pkm', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '0',
                    },
                    slot: 8,
                    id: 'cannotMove',
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-save-cannot-move');
        });

        test('should be droppable to save', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'save-item',
                        saveId: 789,
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });

        test('should be droppable to main', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMove.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });

        test('should be droppable to main as attached', async () => {
            const { result, waitForQueries } = await renderDroppable({
                source: {
                    container: {
                        type: 'save-item',
                        saveId: 123,
                        boxId: '1',
                    },
                    ids: [ 'canMove' ],
                },
                target: {
                    container: {
                        type: 'main-item',
                        boxId: '0',
                    },
                    slot: 10,
                },
            });

            result.current.dragMoveAttached.startDragByClick!();

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });
    });
});
