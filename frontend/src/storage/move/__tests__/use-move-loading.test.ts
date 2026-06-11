import { describe, expect, test } from 'vitest';
import { renderHookWithWrapper } from './utils/render-hook-with-wrapper';
import { useDragSubmitting } from '../../../ui-new/interaction/move/hooks/use-drag-submitting';
import { containerFns, type MoveContainerValue } from '../move-container-fns';

const useMoveLoading = (saveId: number | null, boxId: number, boxSlot: number, pkmId?: string) => {
    return useDragSubmitting<MoveContainerValue>(
        saveId
            ? {
                type: 'save-item',
                saveId,
                boxId: boxId + '',
            }
            : {
                type: 'main-item',
                boxId: boxId + '',
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
                undefined,
                {
                    initialState: {
                        status: 'dragging',
                        trigger: 'click',
                        source: {
                            containerId: containerFns.getContainerHash({
                                type: 'main-item',
                                boxId: '0',
                            }),
                            sourceId: 'canMove',
                            ids: new Set([ 'canMove' ]),
                        },
                        slotsStates: { rootItems: {}, items: {} },
                    },
                }
            );

            await waitForQueries();

            expect(result.current).toBeFalsy();
        });

        test('should be loading if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveLoading(null, 2, 2),
                undefined,
                {
                    initialState: {
                        status: 'loading',
                        source: {
                            containerId: containerFns.getContainerHash({
                                type: 'main-item',
                                boxId: '1',
                            }),
                            sourceId: 'canMove',
                            ids: new Set([ 'canMove' ]),
                        },
                        target: {
                            targetContainerId: containerFns.getContainerHash({
                                type: 'main-item',
                                boxId: '2',
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
                undefined,
                {
                    initialState: {
                        status: 'dragging',
                        trigger: 'click',
                        source: {
                            containerId: containerFns.getContainerHash({
                                type: 'save-item',
                                saveId: 123,
                                boxId: '0',
                            }),
                            sourceId: 'canMove',
                            ids: new Set([ 'canMove' ]),
                        },
                        slotsStates: { rootItems: {}, items: {} },
                    },
                }
            );

            await waitForQueries();

            expect(result.current).toBeFalsy();
        });

        test('should be loading if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveLoading(123, 2, 2),
                undefined,
                {
                    initialState: {
                        status: 'loading',
                        source: {
                            containerId: containerFns.getContainerHash({
                                type: 'save-item',
                                saveId: 123,
                                boxId: '1',
                            }),
                            sourceId: 'canMove',
                            ids: new Set([ 'canMove' ]),
                        },
                        target: {
                            targetContainerId: containerFns.getContainerHash({
                                type: 'save-item',
                                saveId: 123,
                                boxId: '2',
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
