import { Button, Checkbox, Group, Stack, type ButtonProps } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { type HTMLProps } from 'react';
import type { SelectContext } from '../select/context/select-context';
import { SelectProvider } from '../select/context/select-provider';
import { useSelectContextActions, useSelectHasValue } from '../select/context/use-select-context';
import { DragRender } from './components/drag-render';
import type { MoveTargetInput, MoveTargetOutput } from './context/move-context';
import { MoveProvider } from './context/move-provider';
import { getDropPositions } from './hooks/get-drop-positions';
import { useDragSubmitting } from './hooks/use-drag-submitting';
import { useDragging } from './hooks/use-dragging';
import { useDroppable } from './hooks/use-droppable';
import type { MoveSource } from './state/move-state';

const meta = {
    title: 'Interaction/Move',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type ContainerValue = {
    type: 'slot' | 'bank';
    bankId: string;
    box: number;
};

const FakeItemDraggable: React.FC<{
    box: number;
    pos: number;
    name: string;
    children?: React.ReactNode;
}> = ({ box, pos, name, children }) => {
    // console.log('render drag', box, pos);

    const container: ContainerValue = {
        type: 'slot',
        bankId: '',
        box,
    };

    const targetContainer: ContainerValue = {
        type: 'slot',
        bankId: '',
        box,
    };

    const checked = useSelectHasValue<ContainerValue>(container, [ name ]);
    const { addId, removeId } = useSelectContextActions<ContainerValue>();

    const dragging = useDragging<ContainerValue>(name, container);
    const draggingMove = dragging.useDrag();

    const droppable = useDroppable<ContainerValue>({
        targetContainer,
        targetPosition: pos,
        targetId: name,
    });
    // console.log('render drag', box, pos, droppable);

    const submitting = useDragSubmitting<ContainerValue>(container, pos, name);

    const getRender = (props: ButtonProps & HTMLProps<HTMLButtonElement>) => <Button
        variant='filled'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...props as any}
    >
        {children ?? pos} = {name}
    </Button>;

    const disabled = dragging.isDragging || submitting;

    return <>
        <Button.Group>
            {getRender({
                ref: dragging.ref,
                onClick: e => (droppable.onClick ?? draggingMove.toggleDragByClick)?.(e as never),
                onPointerDown: dragging.onPointerDown,
                onPointerUp: droppable.onPointerUp,
                disabled,
                loading: submitting,
                style: { pointerEvents: disabled ? 'none' : undefined }
            })}

            <Button
                onClick={() => checked
                    ? removeId([ name ])
                    : addId(container, [ name ])}
                disabled={dragging.isDragging || submitting}
                p='sm'
            >
                <Checkbox
                    disabled={dragging.isDragging || submitting}
                    checked={checked}
                    style={{ pointerEvents: 'none' }}
                />
            </Button>
        </Button.Group>

        {dragging.isDragging && <DragRender elementRef={dragging.ref}>
            {getRender({})}
        </DragRender>}
    </>;
};

const FakeSlotDroppable: React.FC<{
    box: number;
    pos: number;
    children?: React.ReactNode;
}> = ({ box, pos, children }) => {
    // console.log('render drop', box, pos);

    const targetContainer: ContainerValue = {
        type: 'slot',
        bankId: '',
        box,
    };

    const { isDroppable, onClick, onPointerUp } = useDroppable<ContainerValue>({
        targetContainer,
        targetPosition: pos,
        targetId: undefined,
    });

    const submitting = useDragSubmitting<ContainerValue>(targetContainer, pos);

    return <Button
        loading={submitting}
        disabled={!isDroppable}
        onClick={onClick}
        onPointerUp={onPointerUp}
    >
        {children ?? pos}{submitting && '...'}
    </Button>;
};

export const Primary: Story = {
    render: () => {
        const [ positions, setPositions ] = React.useState<Record<string, {
            box: number;
            pos: number;
        }>>({
            '1': { box: 1, pos: 5 },
            '2': { box: 1, pos: 6 },
            '3': { box: 1, pos: 7 },

            '4': { box: 2, pos: 12 },
            '5': { box: 2, pos: 4 },
            '6': { box: 2, pos: 8 },
        });

        const getNameByPos = (b: number, p: number) => Object.entries(positions).find(([ _, { box, pos } ]) => box === b && pos === p)?.[ 0 ];

        const getBoxItems = (box: number) => new Array(20).fill(0).map((_, i) => {
            const name = getNameByPos(box, i);

            return name
                ? <FakeItemDraggable
                    key={i}
                    box={box}
                    pos={i}
                    name={name}
                />
                : <FakeSlotDroppable
                    key={i}
                    box={box}
                    pos={i}
                />;
        });

        const onDrop = async (source: MoveSource, target: MoveTargetOutput<ContainerValue>) => {
            await new Promise(r => setTimeout(r, 500));

            console.log('drop', source, target);

            setPositions(positions => {
                const sourceIds = [ ...source.ids ];

                const sourceIdsCurrentPositions = sourceIds.reduce<Record<string, number>>((acc, id) => {
                    return {
                        ...acc,
                        [ id ]: positions[ id ]!.pos,
                    };
                }, {});

                const dropPositions = getDropPositions(target.targetPosition, sourceIds, sourceIdsCurrentPositions);

                return sourceIds.reduce((acc, id) => {
                    return {
                        ...acc,
                        [ id ]: {
                            box: target.targetContainer.box,
                            pos: dropPositions[ id ]!,
                        },
                    };
                }, { ...positions });
            });
        };

        const getTargetAllPositions = (source: MoveSource, target: MoveTargetInput<ContainerValue>) => {
            const sourceIds = [ ...source.ids ];

            const sourceIdsCurrentPositions = sourceIds.reduce<Record<string, number>>((acc, id) => {
                return {
                    ...acc,
                    [ id ]: positions[ id ]!.pos,
                };
            }, {});

            return getDropPositions(target.targetPosition, [ ...source.ids ], sourceIdsCurrentPositions);
        };

        const containerFns: Pick<SelectContext<ContainerValue>, 'getContainerHash' | 'getContainerValue'> = {
            getContainerHash: value => value.box ? String(value.box) : '',
            getContainerValue: hash => ({
                type: 'slot',
                bankId: '',
                box: Number(hash),
            }),
        };

        return <SelectProvider<ContainerValue>
            {...containerFns}
        >
            <MoveProvider<ContainerValue, unknown>
                {...containerFns}
                moveContainerId='move-container'
                useFilterStartDragIds={(container, sourceIds) => () => new Set(sourceIds)}
                getTargetAllPositions={getTargetAllPositions}
                dragStartComputeSlotStates={source => ({
                    rootItems: {},
                    items: {},
                })}
                onDrop={onDrop}
            >
                <Stack
                    id='move-container' pos='relative'
                    align='center' gap='xl'
                    py={100} maw={200} m='auto'
                >
                    <div>
                        Move with selection
                    </div>
                    <Group wrap='wrap'>
                        Box 1
                        {getBoxItems(1)}
                    </Group>

                    <Group wrap='wrap'>
                        Box 2
                        {getBoxItems(2)}
                    </Group>
                </Stack>
            </MoveProvider>
        </SelectProvider>;
    },
};
