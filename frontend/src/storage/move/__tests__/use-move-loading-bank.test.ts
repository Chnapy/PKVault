import { describe, expect, test } from 'vitest';
import { useDragSubmitting } from '../../../ui-new/interaction/move/hooks/use-drag-submitting';
import { renderHookWithWrapper } from './utils/render-hook-with-wrapper';
import { containerFns, type MoveContainerValue } from '../move-container-fns';

const useMoveLoadingBank = (bankId: string) => {
    return useDragSubmitting<MoveContainerValue>({
        type: 'bank',
        bankId,
    }, -1);
};

describe('use-move-loading-bank', () => {

    test('should not be loading if move submitting not with current bank', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveLoadingBank('1'),
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
                            type: 'bank',
                            bankId: '2',
                        }),
                        targetAllPositions: {},
                        targetPosition: -1,
                        targetId: undefined,
                    },
                },
            }
        );

        await waitForQueries();

        expect(result.current).toBeFalsy();
    });

    test('should be loading if move submitting with current bank', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveLoadingBank('1'),
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
                            type: 'bank',
                            bankId: '1',
                        }),
                        targetAllPositions: {},
                        targetPosition: -1,
                        targetId: undefined,
                    },
                },
            }
        );

        await waitForQueries();

        expect(result.current).toBeTruthy();
    });
});
