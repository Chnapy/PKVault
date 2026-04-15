import { waitFor } from '@testing-library/dom';
import { describe, expect, test } from 'vitest';
import { getStorageMovePkmBankUrl } from '../../../data/sdk/storage/storage.gen';
import { renderHookWithWrapper } from '../__tests__/render-hook-with-wrapper';
import { setupTestDataServer } from '../__tests__/setup-test-data-server';
import type { MoveState } from '../state/move-state';
import type { DropRefusalReason } from '../validation/types';
import { useMoveDroppableBank } from './use-move-droppable-bank';

describe('use-move-droppable-bank', () => {
    const server = setupTestDataServer();

    test('should not be droppable if not dragging', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
        );

        await waitForQueries();

        expect(result.current.onClick).toBeUndefined();
        expect(result.current.onPointerUp).toBeUndefined();
        expect(result.current._disabledReason).toBe<DropRefusalReason>('not-dragging');
    });

    test('should not be droppable if move submitting', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
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

    test('should not be droppable if same bank', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveDroppableBank('0'),
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
        expect(result.current._disabledReason).toBe<DropRefusalReason>('main-to-same-bank');
    });

    test('should not be droppable if egg', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
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
            () => useMoveDroppableBank('1'),
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
            () => useMoveDroppableBank('1'),
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
            () => useMoveDroppableBank('1'),
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
            () => useMoveDroppableBank('1'),
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

    test('should be droppable', async () => {
        const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
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
                type: 'bank',
                bankId: '1',
            },
        });

        await clickPromise;
        await waitFor(() => expect(lastRequestUrl).toBeDefined());

        expect(lastRequestUrl).toBe('http://localhost:3000' + getStorageMovePkmBankUrl({
            bankId: '1',
            pkmIds: [ 'canMove' ],
        }));

        rerender();

        expect(getMoveContext()).toEqual<MoveState>({
            status: 'idle',
        });
    });

    test('should be droppable as attached', async () => {
        const { result, waitForQueries, getMoveContext, rerender } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
            {
                status: 'dragging',
                source: {
                    saveId: 123,
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
                saveId: 123,
                ids: [
                    'canMove',
                ],
            },
            target: {
                type: 'bank',
                bankId: '1',
            },
        });

        await clickPromise;
        await waitFor(() => expect(lastRequestUrl).toBeDefined());

        expect(lastRequestUrl).toBe('http://localhost:3000' + getStorageMovePkmBankUrl({
            bankId: '1',
            pkmIds: [ 'canMove' ],
            sourceSaveId: 123,
            attached: true,
        }));

        rerender();

        expect(getMoveContext()).toEqual<MoveState>({
            status: 'idle',
        });
    });

    test('should clear selected pkms if any', async () => {
        const { result, waitForQueries, getSelectContext, rerender } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
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
