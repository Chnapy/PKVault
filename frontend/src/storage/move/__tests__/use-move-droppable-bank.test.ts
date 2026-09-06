import { describe, expect, test } from 'vitest';
import type { DropRefusalReason } from '../validation/types';
import { renderDroppable } from './utils/render-droppable';
import { setupTestDataServer } from './utils/setup-test-data-server';

describe('use-move-droppable-bank', () => {
    const _server = setupTestDataServer();

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
                    type: 'bank',
                    bankId: '1',
                },
                slot: -1,
            },
        });

        expect(result.current.onClick).toBeUndefined();
        expect(result.current.onPointerUp).toBeUndefined();
    });

    test('should not be droppable if move submitting', async () => {
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
                    type: 'bank',
                    bankId: '1',
                },
                slot: -1,
            },
            initialState: 'loading',
        });

        result.current.dragMove.startDragByClick!();

        await waitForQueries();

        expect(result.current.onClick).toBeUndefined();
        expect(result.current.onPointerUp).toBeUndefined();
    });

    test('should not be droppable if same bank', async () => {
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
                    type: 'bank',
                    bankId: '0',
                },
                slot: -1,
            },
        });

        result.current.dragMove.startDragByClick!();

        await waitForQueries();

        expect(result.current.onClick).toBeUndefined();
        expect(result.current.onPointerUp).toBeUndefined();
        expect(result.current._disabledReason).toBe<DropRefusalReason>('main-to-same-bank');
    });

    test('should not be droppable if egg', async () => {
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
                    type: 'bank',
                    bankId: '1',
                },
                slot: -1,
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
                    type: 'bank',
                    bankId: '1',
                },
                slot: -1,
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
                    type: 'bank',
                    bankId: '1',
                },
                slot: -1,
            },
        });

        result.current.dragMove.startDragByClick!();

        await waitForQueries();

        expect(result.current.onClick).toBeUndefined();
        expect(result.current.onPointerUp).toBeUndefined();
        expect(result.current._disabledReason).toBe<DropRefusalReason>('save-cannot-move-main-to-main');
    });

    test('should not be droppable to main as attached if cannot move as attached', async () => {
        const { result, waitForQueries } = await renderDroppable({
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
                    type: 'bank',
                    bankId: '1',
                },
                slot: -1,
            },
        });

        await waitForQueries();

        expect(result.current.dragMoveAttached.startDragByClick).toBeUndefined();
    });

    test('should be droppable', async () => {
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
                    type: 'bank',
                    bankId: '1',
                },
                slot: -1,
            },
        });

        result.current.dragMove.startDragByClick!();

        await waitForQueries();

        expect(result.current.onClick).toBeDefined();
    });

    test('should be droppable as attached', async () => {
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
                    type: 'bank',
                    bankId: '1',
                },
                slot: -1,
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
                    type: 'bank',
                    bankId: '1',
                },
                slot: -1,
            },
        });

        result.current.dragMove.startDragByClick!();

        await waitForQueries();

        expect(result.current.onClick).toBeDefined();
    });
});
