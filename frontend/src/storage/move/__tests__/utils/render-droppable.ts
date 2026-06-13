import { useDragging } from '../../../../ui-new/interaction/move/hooks/use-dragging';
import { useDroppable } from '../../../../ui-new/interaction/move/hooks/use-droppable';
import type { MoveSource } from '../../../../ui-new/interaction/move/state/move-state';
import { useDroppableValidation } from '../../hooks/use-droppable-validation';
import { containerFns, type MoveContainerValue, type MoveParams } from '../../move-container-fns';
import { renderHookWithWrapper } from '../utils/render-hook-with-wrapper';

type RenderDroppableParams = {
    source: {
        container: MoveContainerValue;
        ids: string[];
    };
    target: {
        container: MoveContainerValue;
        slot: number;
        id?: string;
    };
    initialState?: 'idle' | 'loading';
};

export const renderDroppable = async ({ source, target, initialState }: RenderDroppableParams) => {
    const searchStorages = [
        {
            saveId: source.container.saveId ?? null,
            boxId: source.container.boxId ? Number(source.container.boxId) : undefined,
        },
        {
            saveId: target.container.saveId ?? null,
            boxId: target.container.boxId ? Number(target.container.boxId) : undefined,
        }
    ]

    const sourceId = source.ids[ 0 ]!;

    const rdr = renderHookWithWrapper(
        () => {
            const droppable = useDroppable({
                targetContainer: target.container,
                targetPosition: target.slot,
                targetId: target.id,
            });

            const sourceObj: MoveSource<MoveParams> = {
                containerId: containerFns.getContainerHash(source.container),
                sourceId,
                ids: new Set(source.ids),
            };

            const draggable = useDragging<MoveContainerValue>(sourceId, source.container);
            const dragMove = draggable.useDrag();
            const dragMoveAttached = draggable.useDrag<MoveParams>({ attached: true });

            const { prefetchQueries } = useDroppableValidation();

            return {
                prefetchQueries: () => prefetchQueries(sourceObj),
                ...droppable,
                // ...draggable,
                dragMove,
                dragMoveAttached,
            };
        },
        {
            storages: searchStorages,
        },
        {
            initialState: initialState === 'loading'
                ? {
                    status: 'loading',
                    source: {
                        containerId: containerFns.getContainerHash(source.container),
                        ids: new Set(source.ids),
                        sourceId,
                    },
                    target: {
                        targetContainerId: containerFns.getContainerHash(target.container),
                        targetPosition: target.slot,
                        targetId: target.id,
                        targetAllPositions: {},
                    },
                }
                : { status: 'idle' },
        },
        source.ids.length > 1
            ? {
                container: containerFns.getContainerHash(source.container),
                ids: new Set(source.ids),
            }
            : undefined
    );

    await rdr.result.current.prefetchQueries();

    await rdr.waitForQueries();

    return rdr;
};
