import { Button, Checkbox, Group, Stack, type ButtonProps } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { type HTMLProps } from 'react';
import type { SelectContext } from '../select/context/select-context';
import { SelectProvider } from '../select/context/select-provider';
import { useSelectContextActions, useSelectHasValue } from '../select/context/use-select-context';
import { MoveProvider } from './context/move-provider';
import { getDropPositions } from './hooks/get-drop-positions';
import { useDragSubmitting } from './hooks/use-drag-submitting';
import { useDraggable } from './hooks/use-draggable';
import { useDragging } from './hooks/use-dragging';
import { useDroppable } from './hooks/use-droppable';
import type { MoveSource } from './state/move-state';

const meta = {
    title: 'Interaction/Move',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type ContainerValue = {
    box: number;
};

const FakeItemDraggable: React.FC<{
    box: number;
    pos: number;
    name: string;
    children?: React.ReactNode;
}> = ({ box, pos, name, children }) => {
    console.log('render drag', box, pos);

    const container: ContainerValue = { box };

    const checked = useSelectHasValue<ContainerValue>(container, [ name ]);
    const { addId, removeId } = useSelectContextActions<ContainerValue>();

    const { startDrag, onPointerMove } = useDraggable<ContainerValue>(
        container,
        [ name ],
    );

    const dragging = useDragging<ContainerValue>(
        name,
        container,
        (index) => [ index * 80, 0 ],
    );

    const submitting = useDragSubmitting<ContainerValue>(container, name);

    const getRender = (props: ButtonProps & HTMLProps<HTMLButtonElement>) => <Button
        variant='filled'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...props as any}
    >
        {children ?? pos} = {name}
    </Button>;

    return <>
        <Button.Group>
            {getRender({
                onClick: startDrag,
                onPointerMove: onPointerMove,
                disabled: dragging.isDragging || submitting,
                loading: submitting,
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

        {dragging.renderDragItem(
            getRender({})
        )}
    </>;
};

const FakeSlotDroppable: React.FC<{
    box: number;
    pos: number;
    onDrop: (source: MoveSource, pos: number) => Promise<unknown>,
    children?: React.ReactNode;
}> = ({ box, pos, onDrop, children }) => {
    console.log('render drop', box, pos);

    const container: ContainerValue = { box };

    const { isDragging, onClick, onPointerUp } = useDroppable<null>(
        null,
        (source) => onDrop(source, pos),
    );

    const submitting = useDragSubmitting<ContainerValue>(container);

    return <Button
        loading={submitting}
        disabled={!isDragging || submitting}
        onClick={onClick}
        onPointerUp={onPointerUp}
    >
        {children ?? pos}
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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const getNameByPos = (b: number, p: number) => Object.entries(positions).find(([ _, { box, pos } ]) => box === b && pos === p)?.[ 0 ];

        const getBoxItems = (box: number) => new Array(20).fill(0).map((_, i) => {
            const name = getNameByPos(box, i);
            // const boxPositions = Object.fromEntries<number>(Object.entries(positions)
            //     .filter(e => e[ 1 ].box === box)
            //     .map(e => [ e[ 0 ], e[ 1 ].pos ]));

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
                    onDrop={async (source, dropPos) => {
                        await new Promise(r => setTimeout(r, 500));

                        console.log(source, dropPos);

                        setPositions(positions => {
                            const sourceIds = [ ...source.ids ];

                            const sourceIdsCurrentPositions = sourceIds.reduce<Record<string, number>>((acc, id) => {
                                return {
                                    ...acc,
                                    [ id ]: positions[ id ]!.pos,
                                };
                            }, {});

                            const dropPositions = getDropPositions(dropPos, sourceIds, sourceIdsCurrentPositions);

                            return sourceIds.reduce((acc, id) => {
                                return {
                                    ...acc,
                                    [ id ]: {
                                        box,
                                        pos: dropPositions[ id ]!,
                                    },
                                };
                            }, { ...positions });
                        });
                    }}
                />;
        });

        const containerFns: Pick<SelectContext<ContainerValue>, 'getContainerHash' | 'getContainerValue'> = {
            getContainerHash: value => value.box ? String(value.box) : '',
            getContainerValue: hash => ({ box: Number(hash) }),
        };

        return <MoveProvider<ContainerValue>
            moveContainerId='move-container'
            {...containerFns}
        >
            <SelectProvider<ContainerValue>
                {...containerFns}
            >
                <Stack
                    id='move-container' pos='relative'
                    align='center' gap='xl' p={100}
                >
                    <Group wrap='wrap'>
                        Box 1
                        {getBoxItems(1)}
                    </Group>

                    <Group wrap='wrap'>
                        Box 2
                        {getBoxItems(2)}
                    </Group>
                </Stack>
            </SelectProvider>
        </MoveProvider>;
    },
};
