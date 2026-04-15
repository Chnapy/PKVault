import { describe, expect, test } from 'vitest';
import { useMoveLoading } from './use-move-loading';
import { renderHookWithWrapper } from '../__tests__/render-hook-with-wrapper';

describe('use-move-loading', () => {

    describe('pkm-variant loading state', () => {
        test('should not be loading if not move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveLoading(undefined, 2, 2),
                {
                    status: 'dragging',
                    source: {
                        ids: [ 'canMove' ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current).toBeFalsy();
        });

        test('should be loading if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveLoading(undefined, 2, 2),
                {
                    status: 'loading',
                    source: {
                        ids: [ 'canMove' ],
                    },
                    target: {
                        type: 'slot',
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
                () => useMoveLoading(123, 2, 2),
                {
                    status: 'dragging',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                    },
                }
            );

            await waitForQueries();

            expect(result.current).toBeFalsy();
        });

        test('should be loading if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveLoading(123, 2, 2),
                {
                    status: 'loading',
                    source: {
                        saveId: 123,
                        ids: [ 'canMove' ],
                    },
                    target: {
                        type: 'slot',
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
});
