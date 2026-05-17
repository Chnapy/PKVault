import { Badge, Button, Card, Group, Popover, Stack } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { getBackControl } from '../controls/common-controls/back-controls';
import { getMoveControl } from '../controls/common-controls/move-controls';
import { getSelectControl } from '../controls/common-controls/select-controls';
import { ControlsProvider } from '../controls/provider/controls-provider';
import { useAllCurrentControls } from '../controls/use-all-current-controls';
import { useControls } from '../controls/use-controls';
import { useFocusNode } from './node/use-focus-node';
import { FocusProvider } from './provider/focus-provider';
import { Focus } from './provider/use-focus-context';
import { FocusScope } from './scope/focus-scope';

const meta = {
    title: 'UX/Focus',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const FakePanel: React.FC<{ id: string; focusOnMount?: boolean; children: React.ReactNode }> = ({ id, focusOnMount, children }) => {
    // console.log('render panel', id);
    const scopeId = 'storage-grid-' + id;

    const { pushScope, popScope } = Focus.usePushPopScope();

    const { ref, nodeId, focused, active } = useFocusNode<HTMLDivElement>({
        scopeNodeId: id,
        focusOnMount,
    });

    const controlProps = useControls(nodeId,
        [
            getMoveControl({
                label: 'Move',
            }),
            getSelectControl({
                label: 'Select',
                action: () => pushScope(scopeId),
            }),
            getBackControl({
                label: 'Back',
                action: () => popScope(),
            }),
        ],
        {
            enabled: focused,
        }
    );

    return <Card
        ref={ref}
        title={`panel id=${id} scopeId=${scopeId} active=${active} focusOnMount=${focusOnMount}`}
        style={{
            outline: focused ? '2px solid red' : undefined,
        }}
        {...controlProps}
    >
        <FocusScope id={scopeId} parentNodeId={nodeId}>
            {children}
        </FocusScope>
    </Card>;
};

const FakeItem: React.FC<{
    id: string;
    target?: string;
    onClick?: () => void;
    openModal?: boolean;
    focusOnMount?: boolean;
    children?: React.ReactNode;
}> = ({ id, target, onClick, openModal, focusOnMount, children }) => {
    // console.log('render item', id);

    const { pushScope, popScope } = Focus.usePushPopScope();

    const { ref, nodeId, active, focused, focusProps } = useFocusNode<HTMLButtonElement>({
        scopeNodeId: id,
        focusOnMount,
    });

    const controlProps = useControls(nodeId,
        [
            getMoveControl({
                label: 'Move',
            }),
            onClick && getSelectControl({
                label: 'Select',
                action: onClick,
            }),
            // eslint-disable-next-line react-hooks/refs
            openModal && getSelectControl({
                label: 'Open modal',
                action: () => ref.current?.click(),
            }),
            getBackControl({
                label: 'Back',
                action: () => popScope(),
            }),
            target && {
                label: 'Target ' + target,
                triggers: {
                    keyboard: {
                        type: 'keyboard',
                        icon: 'E',
                        values: [ 'e' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        icon: 'X',
                        values: [ 'X' ],
                    },
                },
                action: () => pushScope(target),
            },
        ],
        {
            enabled: focused,
        }
    );

    return <Button
        ref={ref}
        title={`item id=${id} active=${active}`}
        style={{
            color: focused ? undefined : '#FFFA',
            outline: focused ? '2px solid red' : undefined,
        }}
        {...focusProps}
        {...controlProps}
    >
        {children ?? id}{target && ` -> ${target}`}
    </Button>;
};

const FakeFooter: React.FC = () => {
    const getControls = useAllCurrentControls();

    return <Card>
        <Group>
            {getControls().map(c => <Badge key={c.label} leftSection={c.trigger.icon} size='xl'>
                {c.label}
            </Badge>)}
        </Group>
    </Card>;
};

export const Primary: Story = {
    render: () => {
        const [ renderRightPart, setRenderRightPart ] = React.useState(true);
        const [ renderAllItems, setRenderAllItems ] = React.useState(true);
        const [ renderFooter, setRenderFooter ] = React.useState(true);

        return <ControlsProvider>
            <FocusProvider>
                <FocusScope id="panels">
                    <Stack align='center' p='xl'>

                        <FakePanel id='header'>
                            <Group>
                                <FakeItem id='1' />
                                <FakeItem id='2' />
                                <FakeItem id='3' />
                            </Group>
                        </FakePanel>

                        <FakePanel id='1'>
                            <Group>
                                {/* test when focused item unmount */}
                                {renderRightPart && <Card>
                                    <FakeItem id='7' />
                                    <FakeItem id='8' onClick={() => setRenderRightPart(false)} />
                                    <FakeItem id='9' />
                                </Card>}

                                <Card>
                                    <FakeItem id='4' />
                                    <FakeItem id='5' />
                                    <FakeItem id='6' />
                                </Card>
                            </Group>
                        </FakePanel>

                        <FakePanel id='2'>
                            <Group>
                                <Card>
                                    <FakeItem id='4a' />
                                    <FakeItem id='5a' />
                                    <FakeItem id='6a' />

                                    <FakePanel id='2b'>
                                        <FakeItem id='5b' />
                                        <FakeItem id='6b' />
                                    </FakePanel>

                                    {/* test programmatic focus on click */}
                                    <FakeItem id='t1' target='storage-grid-2b' />
                                </Card>

                                <Card>
                                    <FakeItem id='7a' />
                                    <FakeItem id='8a' />
                                    <Popover>
                                        <Popover.Target>
                                            <div>
                                                <FakeItem id='9a' openModal />
                                            </div>
                                        </Popover.Target>

                                        <Popover.Dropdown>
                                            <FocusScope id='popover-1'>
                                                <FakeItem id='p1' />
                                                <FakeItem id='p2' focusOnMount />

                                                <Popover withinPortal={false}>
                                                    <Popover.Target>
                                                        <div>
                                                            <FakeItem id='p3' openModal />
                                                        </div>
                                                    </Popover.Target>

                                                    <Popover.Dropdown>
                                                        <FocusScope id='popover-2'>
                                                            <FakeItem id='pp1' />
                                                            <FakeItem id='pp2' focusOnMount />
                                                            <FakeItem id='pp3' />
                                                        </FocusScope>
                                                    </Popover.Dropdown>
                                                </Popover>
                                            </FocusScope>
                                        </Popover.Dropdown>
                                    </Popover>
                                </Card>
                            </Group>
                        </FakePanel>

                        <FakePanel id='3'>
                            {/* test when all items unmount */}
                            {renderAllItems && <Group>
                                <FakeItem id='10' />
                                <FakeItem id='11' onClick={() => setRenderAllItems(false)} />
                                <FakeItem id='12' />
                            </Group>}

                        </FakePanel>

                        {/* test when the whole panel unmount */}
                        {renderFooter && <FakePanel id='footer'>
                            <Group>
                                <FakeItem id='13' />
                                <FakeItem id='14' onClick={() => setRenderFooter(false)} />
                                <FakeItem id='15' />
                            </Group>
                        </FakePanel>}

                        <FakeFooter />
                    </Stack>
                </FocusScope>
            </FocusProvider>
        </ControlsProvider>;
    },
};
