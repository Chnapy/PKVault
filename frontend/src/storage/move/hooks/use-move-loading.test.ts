import { describe, expect, test } from 'vitest';
import { renderHookWithWrapper } from '../__tests__/render-hook-with-wrapper';
import { useDragSubmitting } from '../../../ui-new/interaction/move/hooks/use-drag-submitting';
import { containerFns, type MoveContainerValue } from '../state/move-select-impl-provider';

const useMoveLoading = (saveId: number | null, boxId: number, boxSlot: number, pkmId?: string) => {
    return useDragSubmitting<MoveContainerValue>(
        {
            bankId: '',
            saveId,
            boxId: boxId + '',
            type: 'main-item',
        },
        boxSlot,
        pkmId,
    );
};

describe('use-move-loading', () => {

    describe('pkm-variant loading state', () => {
        test('should not be loading if not move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveLoading(null, 2, 2),
                {
                    initialState: {
                        status: 'dragging',
                        trigger: 'click',
                        source: {
                            containerId: containerFns.getContainerHash({
                                bankId: '',
                                boxId: '0',
                                saveId: null,
                                type: 'main-item',
                            }),
                            sourceId: 'canMove',
                            ids: new Set([ 'canMove' ]),
                        },
                    },
                }
            );

            await waitForQueries();

            expect(result.current).toBeFalsy();
        });

        test('should be loading if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveLoading(null, 2, 2),
                {
                    initialState: {
                        status: 'loading',
                        source: {
                            containerId: containerFns.getContainerHash({
                                bankId: '',
                                boxId: '1',
                                saveId: null,
                                type: 'main-item',
                            }),
                            sourceId: 'canMove',
                            ids: new Set([ 'canMove' ]),
                        },
                        target: {
                            targetContainerId: containerFns.getContainerHash({
                                bankId: '',
                                boxId: '2',
                                saveId: null,
                                type: 'main-item',
                            }),
                            targetAllPositions: { 'canMove': 2 },
                            targetPosition: 2,
                            targetId: undefined,
                        },
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
                    initialState: {
                        status: 'dragging',
                        trigger: 'click',
                        source: {
                            containerId: containerFns.getContainerHash({
                                bankId: '',
                                boxId: '0',
                                saveId: 123,
                                type: 'main-item',
                            }),
                            sourceId: 'canMove',
                            ids: new Set([ 'canMove' ]),
                        },
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
                    initialState: {
                        status: 'loading',
                        source: {
                            containerId: containerFns.getContainerHash({
                                bankId: '',
                                boxId: '1',
                                saveId: 123,
                                type: 'main-item',
                            }),
                            sourceId: 'canMove',
                            ids: new Set([ 'canMove' ]),
                        },
                        target: {
                            targetContainerId: containerFns.getContainerHash({
                                bankId: '',
                                boxId: '2',
                                saveId: 123,
                                type: 'main-item',
                            }),
                            targetAllPositions: { 'canMove': 2 },
                            targetPosition: 2,
                            targetId: undefined,
                        },
                    },
                }
            );

            await waitForQueries();

            expect(result.current).toBeTruthy();
        });
    });
});
