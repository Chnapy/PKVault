import { Button, Card, Checkbox, Group, Stack, type ButtonProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { type HTMLAttributes } from 'react';
import type { PopoverTargetChildProps } from '../popover/target-open-popover';
import { getControlIcon } from './controls/icons/get-control-icon';
import { WithControlsIcons } from './controls/icons/with-controls-icons';
import { useAllCurrentControls } from './controls/use-all-current-controls';
import { useDragControls } from './focus-controls/common-controls/drag-controls';
import { getSelectControl } from './focus-controls/common-controls/select-controls';
import { usePopover } from './focus-controls/components/popover/hooks/use-popover';
import { PopoverWithControls } from './focus-controls/components/popover/popover-with-controls';
import { FocusControlsProvider } from './focus-controls/provider/focus-controls-provider';
import { useFocusControls } from './focus-controls/use-focus-controls';
import { Focus } from './focus/provider/use-focus-context';
import { FocusScope } from './focus/scope/focus-scope';
import { DragRender } from './move/components/drag-render';
import type { MoveTargetInput } from './move/context/move-context';
import { MoveProvider } from './move/context/move-provider';
import { useDragSubmitting } from './move/hooks/use-drag-submitting';
import { useDragging } from './move/hooks/use-dragging';
import { useDroppable } from './move/hooks/use-droppable';
import type { MoveSource } from './move/state/move-state';
import type { SelectContext } from './select/context/select-context';
import { SelectProvider } from './select/context/select-provider';
import { useSelectContextActions, useSelectHasValue } from './select/context/use-select-context';

const meta = {
    title: 'Interaction/All',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type ContainerValue = { box: number; };

const FakePanel: React.FC<{ name: string; focusOnMount?: boolean; children: React.ReactNode }> = ({ name, focusOnMount, children }) => {
    // console.log('render panel', id);
    const childScopeId = 'storage-grid-' + name;

    const isInScopeStack = Focus.useIsInScopeStack(childScopeId);

    const { pushScope } = Focus.usePushPopScope();

    const { nodeId, focused, active, focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        childScopeId,
        focusOnMount,
        controls: [
            getSelectControl({
                label: 'Select',
                action: () => pushScope(childScopeId),
            }),
        ],
    });

    return <WithControlsIcons placement='in' icons={controlIcons('open')}>
        <Card
            title={`panel name=${name} scopeId=${childScopeId} active=${active} focusOnMount=${focusOnMount}`}
            style={{
                flexGrow: 1,
                outline: focused
                    ? '2px solid red'
                    : isInScopeStack
                        ? '2px solid #800'
                        : undefined,
            }}
            {...focusProps}
            {...controlProps('open')}
        >
            <FocusScope id={childScopeId} parentNodeId={nodeId}>
                {children}
            </FocusScope>
        </Card>
    </WithControlsIcons>;
};

const FakeItem: React.FC<{
    name: string;
    box: number;
    pos: number;
    target?: string;
    onClick?: () => void;
    openModal?: boolean;
    focusOnMount?: boolean;
    children?: React.ReactNode;
} & PopoverTargetChildProps> = ({ name, box, pos, target, onClick, openModal, focusOnMount, children, ...popoverProps }) => {
    // console.log('render item', id);

    const popover = usePopover();

    const { pushScope } = Focus.usePushPopScope();

    const container: ContainerValue = { box };

    const checked = useSelectHasValue<ContainerValue>(container, [ name ]);
    const { addId, removeId } = useSelectContextActions<ContainerValue>();

    const dragging = useDragging<ContainerValue>(
        name,
        container,
    );
    const draggingMove = dragging.useDrag();
    // console.log(dragging.dragProps)
    const submitting = useDragSubmitting<ContainerValue>(container, pos, name);

    const dragControls = useDragControls({ dragging, draggingMove });

    const { focusProps, controlProps, controlIcons, focused, active } = useFocusControls({
        scopeNodeId: name,
        focusOnMount,
        onFocus: ({ node }) => {
            // console.dir(node);

            dragging.focusNode(node);
        },
        controls: [
            onClick && getSelectControl({
                label: 'Select',
                action: onClick,
            }),
            ...dragControls,
            openModal && getSelectControl({
                label: 'Open modal',
                action: () => popover?.setOpened(opened => !opened),
            }),
            target && {
                name: 'target',
                label: 'Target ' + target,
                triggers: {
                    keyboard: {
                        type: 'keyboard',
                        values: [ 'e' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'X' ],
                    },
                },
                spread: false,
                action: () => pushScope(target),
            },
        ],
    });

    const ref = useMergedRef(
        dragging.ref,
        focusProps.ref,
        controlProps('open', 'drag', 'drag-attached', 'drop', 'target').ref,
        popoverProps.ref
    );

    const renderBtn = (props: ButtonProps & HTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>) => <Button
        {...props}
    >
        {children ?? name}{target && ` -> ${target}`}
    </Button>;

    // console.log(dragging.dragProps, focusControlProps, popoverProps);

    return <Group>
        <WithControlsIcons placement='out' icons={controlIcons('open', 'drag', 'drag-attached', 'drop', 'target')}>
            {renderBtn({
                title: `item name=${name} active=${active}`,
                style: {
                    fontWeight: focused ? 'bold' : 'normal',
                    outline: focused ? '2px solid red' : undefined,
                },
                disabled: dragging.isDragging,
                loading: submitting,
                ...focusProps,
                ...controlProps('open', 'drag', 'drag-attached', 'drop', 'target'),
                ...popoverProps,
                ref,
            })}
        </WithControlsIcons>

        <Checkbox
            disabled={dragging.isDragging || submitting}
            checked={checked}
            onClick={() => checked ? removeId([ name ]) : addId(container, [ name ])}
        />

        {dragging.isDragging && <DragRender elementRef={dragging.ref}>
            {renderBtn({})}
        </DragRender>}
    </Group>;
};

const FakeSlotDroppable: React.FC<{
    box: number;
    pos: number;
    children?: React.ReactNode;
}> = ({ box, pos, children }) => {
    // console.log('render drop', box, pos);

    const container: ContainerValue = { box };

    const { isDroppable, onClick, onPointerUp } = useDroppable<ContainerValue>({
        targetContainer: container,
        targetPosition: pos,
        targetId: undefined,
    });

    const submitting = useDragSubmitting<ContainerValue>(container, pos);

    return <Button
        loading={submitting}
        disabled={!isDroppable || submitting}
        onClick={onClick}
        onPointerUp={onPointerUp}
    >
        D{children ?? pos}
    </Button>;
};

const FakeItemWithGlobalControl: React.FC<{
    name: string;
    focusOnMount?: boolean;
    children?: React.ReactNode;
}> = ({ name, focusOnMount, children }) => {
    // console.log('render item', id);

    const [ special, setSpecial ] = React.useState(false);

    const { focusProps, controlProps, controlIcons, active, focused } = useFocusControls({
        scopeNodeId: name,
        focusOnMount,
        controls: [
            {
                name: 'special',
                label: 'Special',
                triggers: {
                    keyboard: {
                        type: 'keyboard',
                        values: [ 'y' ]
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ]
                    },
                },
                spread: true,
                action: () => setSpecial(state => !state),
            }
        ],
        controlsEnable: 'always',
    });

    const ref = useMergedRef(
        focusProps.ref,
        controlProps('special').ref,
    );

    return <WithControlsIcons placement='out' icons={controlIcons('special')}>
        <Button
            title={`item name=${name} active=${active}`}
            style={{
                fontWeight: focused ? 'bold' : 'normal',
                outline: focused ? '2px solid red' : undefined,
            }}
            {...focusProps}
            {...controlProps('special')}
            ref={ref}
        >
            {children ?? name}{special && ' special pressed'}
        </Button>
    </WithControlsIcons>;
};

const FakeFooter: React.FC = () => {
    const allControls = useAllCurrentControls();

    return <Card>
        <Stack>
            {Object.entries(allControls).map(([ controlId, controls ]) => <Group
                key={controlId}
                gap='lg'
            >
                {controls.map(c => <Group key={c.name}>
                    {getControlIcon(c.trigger.type, c.trigger.values, c.trigger.allowPressedSuite)}
                    {c.label}
                </Group>)}
            </Group>)}
        </Stack>
    </Card>;
};

export const Primary: Story = {
    render: () => {
        const [ renderRightPart, setRenderRightPart ] = React.useState(true);
        const [ renderAllItems, setRenderAllItems ] = React.useState(true);
        const [ renderFooter, setRenderFooter ] = React.useState(true);

        const containerFns: Pick<SelectContext<ContainerValue>, 'getContainerHash' | 'getContainerValue'> = {
            getContainerHash: value => value.box ? String(value.box) : '',
            getContainerValue: hash => ({ box: Number(hash) }),
        };

        const onDrop = async (source: MoveSource, target: MoveTargetInput<ContainerValue>) => console.log(source, target);

        return <FocusControlsProvider>
            <SelectProvider<ContainerValue>
                {...containerFns}
            >
                <MoveProvider<ContainerValue, unknown>
                    {...containerFns}
                    moveContainerId='move-container'
                    useFilterStartDragIds={(_, ids) => () => new Set(ids)}
                    getTargetAllPositions={() => ({})}
                    dragStartComputeSlotStates={source => ({
                        rootItems: {},
                        items: {},
                    })}
                    onDrop={onDrop}
                >
                    <Stack
                        id='move-container' pos='relative'
                        align='center' p='xl'
                    >
                        <div>
                            All interactions
                            <br />Focus - Controls - Move - Select
                        </div>

                        <FakePanel name='header' focusOnMount>
                            <Group>
                                <FakeItem box={0} pos={1} name='1' />
                                <FakeItem box={0} pos={2} name='2' />
                                <FakeItem box={0} pos={3} name='3' />
                                <FakeItemWithGlobalControl name='4' />
                            </Group>
                        </FakePanel>

                        <FakePanel name='drop'>
                            <Group>
                                <FakeSlotDroppable box={0} pos={1} />
                                <FakeSlotDroppable box={0} pos={2} />
                                <FakeSlotDroppable box={0} pos={3} />
                            </Group>
                        </FakePanel>

                        <FakePanel name='1'>
                            <Group>
                                {/* test when focused item unmount */}
                                {renderRightPart && <Card>
                                    <FakeItem box={1} pos={7} name='7' />
                                    <FakeItem box={1} pos={8} name='8' onClick={() => setRenderRightPart(false)} />
                                    <FakeItem box={1} pos={9} name='9' />
                                </Card>}

                                <Card>
                                    <FakeItem box={1} pos={4} name='4' />
                                    <FakeItem box={1} pos={5} name='5' />
                                    <FakeItem box={1} pos={6} name='6' />
                                </Card>
                            </Group>
                        </FakePanel>

                        <FakePanel name='2'>
                            <Group>
                                <Card>
                                    <FakeItem box={2} pos={4} name='4a' />
                                    <FakeItem box={2} pos={5} name='5a' />
                                    <FakeItem box={2} pos={6} name='6a' />

                                    <FakePanel name='2b'>
                                        <FakeItem box={2} pos={5} name='5b' />
                                        <FakeItem box={2} pos={6} name='6b' />
                                    </FakePanel>

                                    {/* test programmatic focus on click */}
                                    <FakeItem box={2} pos={66} name='t1' target='storage-grid-2b' />
                                </Card>

                                <Card>
                                    <FakeItem box={3} pos={7} name='7a' />
                                    <FakeItem box={3} pos={8} name='8a' />

                                    <PopoverWithControls
                                        target={<FakeItem box={3} pos={9} name='9a' openModal />}
                                        dropdown={<>
                                            <FakeItem box={3} pos={1} name='p1' />
                                            <FakeItem box={3} pos={2} name='p2' />

                                            <PopoverWithControls
                                                target={<FakeItem box={3} pos={3} name='p3' />}
                                                dropdown={<>
                                                    <FakeItem box={3} pos={4} name='pp1' />
                                                    <FakeItem box={3} pos={5} name='pp2' />
                                                    <FakeItem box={3} pos={6} name='pp3' />
                                                </>}
                                            />
                                        </>}
                                    />
                                </Card>
                            </Group>
                        </FakePanel>

                        <FakePanel name='3'>
                            {/* test when all items unmount */}
                            {renderAllItems && <Group>
                                <FakeItem box={4} pos={0} name='10' />
                                <FakeItem box={4} pos={1} name='11' onClick={() => setRenderAllItems(false)} />
                                <FakeItem box={4} pos={2} name='12' />
                            </Group>}

                        </FakePanel>

                        {/* test when the whole panel unmount */}
                        {renderFooter && <FakePanel name='footer'>
                            <Group>
                                <FakeItem box={5} pos={3} name='13' />
                                <FakeItem box={5} pos={4} name='14' onClick={() => setRenderFooter(false)} />
                                <FakeItem box={5} pos={5} name='15' />
                            </Group>
                        </FakePanel>}

                        <FakeFooter />
                    </Stack>
                </MoveProvider>
            </SelectProvider>
        </FocusControlsProvider>;
    },
};
