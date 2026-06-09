import { describe, expect, test } from 'vitest';
import type { MoveTargetInput } from '../../../ui-new/interaction/move/context/move-context';
import { useDroppable } from '../../../ui-new/interaction/move/hooks/use-droppable';
import { renderHookWithWrapper } from './utils/render-hook-with-wrapper';
import { setupTestDataServer } from './utils/setup-test-data-server';
import { containerFns, type MoveContainerValue } from '../move-container-fns';
import type { DropRefusalReason } from '../validation/types';
import { useDroppableValidation } from '../hooks/use-droppable-validation';

const useMoveDroppableBank = (bankId: string) => {
    const target: MoveTargetInput<MoveContainerValue> = {
        targetContainer: {
            type: 'bank',
            bankId,
            saveId: null,
            boxId: '',
        },
        targetPosition: -1,
        targetId: undefined,
    };

    const droppable = useDroppable(target);
    const droppableValidation = useDroppableValidation(target.targetPosition, target.targetContainer);

    return droppableValidation.canDrop
        ? {
            ...droppable,
            ...droppableValidation,
        }
        : {
            ...droppable,
            ...droppableValidation,
            onClick: undefined,
            onDrop: undefined,
            onPointerUp: undefined,
        };
};

describe('use-move-droppable-bank', () => {
    const server = setupTestDataServer();

    test('should not be droppable if not dragging', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
        );

        await waitForQueries();

        expect(result.current.onClick).toBeUndefined();
        expect(result.current.onPointerUp).toBeUndefined();
    });

    test('should not be droppable if move submitting', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
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
                            type: 'bank',
                            bankId: '1',
                            saveId: null,
                            boxId: '',
                        }),
                        targetAllPositions: {},
                        targetId: undefined,
                        targetPosition: -1,
                    },
                },
            }
        );

        await waitForQueries();

        expect(result.current.onClick).toBeUndefined();
        expect(result.current.onPointerUp).toBeUndefined();
    });

    test('should not be droppable if same bank', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveDroppableBank('0'),
            {
                initialState: {
                    status: 'dragging',
                    trigger: 'click',
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
                },
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
                initialState: {
                    status: 'dragging',
                    trigger: 'click',
                    source: {
                        containerId: containerFns.getContainerHash({
                            bankId: '',
                            boxId: '1',
                            saveId: 123,
                            type: 'main-item',
                        }),
                        sourceId: 'egg',
                        ids: new Set([ 'egg' ]),
                    },
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
                initialState: {
                    status: 'dragging',
                    trigger: 'click',
                    source: {
                        containerId: containerFns.getContainerHash({
                            bankId: '',
                            boxId: '1',
                            saveId: 123,
                            type: 'main-item',
                        }),
                        sourceId: 'shadow',
                        ids: new Set([ 'shadow' ]),
                    },
                },
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
                initialState: {
                    status: 'dragging',
                    trigger: 'click',
                    source: {
                        containerId: containerFns.getContainerHash({
                            bankId: '',
                            boxId: '1',
                            saveId: 123,
                            type: 'main-item',
                        }),
                        sourceId: 'cannotMoveToMain',
                        ids: new Set([ 'cannotMoveToMain' ]),
                    },
                },
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
                initialState: {
                    status: 'dragging',
                    trigger: 'click',
                    source: {
                        containerId: containerFns.getContainerHash({
                            bankId: '',
                            boxId: '1',
                            saveId: 123,
                            type: 'main-item',
                        }),
                        sourceId: 'cannotMoveAttachedToMain',
                        ids: new Set([ 'cannotMoveAttachedToMain' ]),
                        params: { attached: true },
                    },
                },
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
                initialState: {
                    status: 'dragging',
                    trigger: 'click',
                    source: {
                        containerId: containerFns.getContainerHash({
                            bankId: '',
                            boxId: '1',
                            saveId: 123,
                            type: 'main-item',
                        }),
                        sourceId: 'existID',
                        ids: new Set([ 'existID' ]),
                    },
                },
            }
        );

        await waitForQueries();

        expect(result.current.onClick).toBeUndefined();
        expect(result.current.onPointerUp).toBeUndefined();
        expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-main-variant-already-exist');
    });

    test('should be droppable', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
            {
                initialState: {
                    status: 'dragging',
                    trigger: 'click',
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
                },
            }
        );

        await waitForQueries();

        expect(result.current.onClick).toBeDefined();
    });

    test('should be droppable as attached', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
            {
                initialState: {
                    status: 'dragging',
                    trigger: 'click',
                    source: {
                        containerId: containerFns.getContainerHash({
                            bankId: '',
                            boxId: '1',
                            saveId: 123,
                            type: 'main-item',
                        }),
                        sourceId: 'canMove',
                        ids: new Set([ 'canMove' ]),
                        params: { attached: true },
                    },
                },
            }
        );

        await waitForQueries();

        expect(result.current.onClick).toBeDefined();
    });

    test('should clear selected pkms if any', async () => {
        const { result, waitForQueries } = renderHookWithWrapper(
            () => useMoveDroppableBank('1'),
            {
                initialState: {
                    status: 'dragging',
                    trigger: 'click',
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
                },
            },
            {
                container: containerFns.getContainerHash({
                    bankId: '',
                    saveId: null,
                    boxId: '1',
                    type: 'main-item',
                }),
                ids: new Set([ 'canMove', 'canMove2' ]),
            },
        );

        await waitForQueries();

        expect(result.current.onClick).toBeDefined();
    });
});
