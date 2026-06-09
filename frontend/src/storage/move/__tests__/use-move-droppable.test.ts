import { describe, expect, test } from 'vitest';
import type { MoveTargetInput } from '../../../ui-new/interaction/move/context/move-context';
import { useDroppable } from '../../../ui-new/interaction/move/hooks/use-droppable';
import { renderHookWithWrapper } from './utils/render-hook-with-wrapper';
import { setupTestDataServer } from './utils/setup-test-data-server';
import { containerFns, type MoveContainerValue } from '../move-container-fns';
import type { DropRefusalReason } from '../validation/types';
import { useDroppableValidation } from '../hooks/use-droppable-validation';

const useMoveDroppable = (target: MoveTargetInput<MoveContainerValue>) => {
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

describe('use-move-droppable', () => {
    const server = setupTestDataServer();

    describe('pkm-variant droppable state', () => {
        test('should not be droppable if not dragging', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '2',
                        type: 'main-item',
                    },
                    targetPosition: 2,
                    targetId: undefined,
                }),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            // expect(result.current._disabledReason).toBe<DropRefusalReason>('not-dragging');
        });

        test('should not be droppable if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '2',
                        type: 'main-item',
                    },
                    targetPosition: 2,
                    targetId: undefined,
                }),
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
                                boxId: '1',
                                saveId: null,
                                type: 'main-item',
                            }),
                            targetAllPositions: { 'canMove': 1 },
                            targetPosition: 1,
                            targetId: undefined,
                        },
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            // expect(result.current._disabledReason).toBe<DropRefusalReason>('not-dragging');
        });

        test('should not be droppable if targeting moving pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 0,
                    targetId: undefined,
                }),
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

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('same-pkm-id');
        });

        test('should not be droppable if target slot out of bounds', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 29,
                    targetId: undefined,
                }),
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
                            ids: new Set([ 'canMove', 'canMove2' ]),
                        },
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('out-of-bounds');
        });

        test('should not be droppable as attached if targeting pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 1,
                    targetId: undefined,
                }),
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
                            params: {
                                attached: true,
                            },
                        },
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('attached-target-occupied');
        });

        test('should not be droppable to save if box cannot receive pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '2',
                        type: 'save-item',
                    },
                    targetPosition: 1,
                    targetId: undefined,
                }),
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
                        }
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
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                            params: {
                                attached: true,
                            },
                        },
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
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                            sourceId: 'canMoveNotCompatible',
                            ids: new Set([ 'canMoveNotCompatible' ]),
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-to-save-incompatible-version');
        });

        test('should not be droppable to save if can not move', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                            sourceId: 'cannotMoveToSave',
                            ids: new Set([ 'cannotMoveToSave' ]),
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-cannot-move-to-save');
        });

        test('should not be droppable to save as attached if cannot move as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                            sourceId: 'cannotMoveAttachedToSave',
                            ids: new Set([ 'cannotMoveAttachedToSave' ]),
                            params: { attached: true },
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-cannot-move-to-save');
        });

        test('should not be droppable to save if used variant is disabled', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                            sourceId: 'isDisabled',
                            ids: new Set([ 'isDisabled' ]),
                            params: { attached: true },
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-disabled-to-save');
        });

        test('should not be droppable to save if no variant used and target pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 456,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 0,
                    targetId: undefined,
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-no-variant-to-save-occupied');
        });

        test('should not be droppable to save if already attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                            sourceId: 'isAttached',
                            ids: new Set([ 'isAttached' ]),
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-already-attached-to-save');
        });

        test('should not be droppable to main occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 2,
                    targetId: 'cannotMove',
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('pkm-cannot-move');
        });

        test('should not be droppable to save occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 5,
                    targetId: 'cannotMoveToMain',
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-cannot-move-main-to-main');
        });

        test('should be droppable to main', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
                {
                    initialState: {
                        status: 'dragging',
                        trigger: 'drag',
                        source: {
                            containerId: containerFns.getContainerHash({
                                bankId: '',
                                boxId: '1',
                                saveId: null,
                                type: 'main-item',
                            }),
                            sourceId: 'canMove',
                            ids: new Set([ 'canMove' ]),
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onPointerUp).toBeDefined();
        });

        test('should be droppable to save', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });

        test('should be droppable to save as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
                {
                    initialState: {
                        status: 'dragging',
                        trigger: 'drag',
                        source: {
                            containerId: containerFns.getContainerHash({
                                bankId: '',
                                boxId: '1',
                                saveId: null,
                                type: 'main-item',
                            }),
                            sourceId: 'canMove',
                            ids: new Set([ 'canMove' ]),
                            params: { attached: true },
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onPointerUp).toBeDefined();
        });

        test('should clear selected pkms if any', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
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

    describe('pkm-save droppable state', () => {
        test('should not be droppable if not dragging', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '2',
                        type: 'main-item',
                    },
                    targetPosition: 2,
                    targetId: undefined,
                }),
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            // expect(result.current._disabledReason).toBe<DropRefusalReason>('not-dragging');
        });

        test('should not be droppable if move submitting', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '2',
                        type: 'main-item',
                    },
                    targetPosition: 2,
                    targetId: undefined,
                }),
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
                                boxId: '1',
                                saveId: 123,
                                type: 'main-item',
                            }),
                            targetAllPositions: { 'canMove': 1 },
                            targetPosition: 1,
                            targetId: undefined,
                        },
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            // expect(result.current._disabledReason).toBe<DropRefusalReason>('not-dragging');
        });

        test('should not be droppable if targeting moving pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 0,
                    targetId: undefined,
                }),
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
                        }
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
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 29,
                    targetId: undefined,
                }),
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
                            ids: new Set([ 'canMove', 'canMove2' ]),
                        }
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
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
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
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 456,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                            sourceId: 'cannotMoveToSave',
                            ids: new Set([ 'cannotMoveToSave' ]),
                        }
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
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 789,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 1,
                    targetId: 'cannotMove',
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-pkm-save-cannot-move');
        });

        test('should not be droppable to save if not same context', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 456,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-save-not-same-context');
        });

        test('should not be droppable to main if egg', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
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
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
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
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
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
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
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
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-main-variant-already-exist');
        });

        test('should not be droppable to main occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 7,
                    targetId: 'cannotMoveToSave',
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('main-cannot-move-to-save');
        });

        test('should not be droppable to save occupied by not movable pkm', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 123,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 8,
                    targetId: 'cannotMove',
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeUndefined();
            expect(result.current.onPointerUp).toBeUndefined();
            expect(result.current._disabledReason).toBe<DropRefusalReason>('save-to-save-cannot-move');
        });

        test('should be droppable to save', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: 789,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });

        test('should be droppable to main', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });

        test('should be droppable to main as attached', async () => {
            const { result, waitForQueries } = renderHookWithWrapper(
                () => useMoveDroppable({
                    targetContainer: {
                        bankId: '',
                        saveId: null,
                        boxId: '0',
                        type: 'main-item',
                    },
                    targetPosition: 10,
                    targetId: undefined,
                }),
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
                        }
                    },
                }
            );

            await waitForQueries();

            expect(result.current.onClick).toBeDefined();
        });
    });
});
