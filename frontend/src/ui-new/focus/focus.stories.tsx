import { Badge, Button, Card, Group, Stack } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { getControlIcon } from '../controls/icons/get-control-icon';
import { useAllCurrentControls } from '../controls/use-all-current-controls';
import { getBackControl } from '../focus-controls/common-controls/back-controls';
import { getMoveControl } from '../focus-controls/common-controls/move-controls';
import { getSelectControl } from '../focus-controls/common-controls/select-controls';
import { PopoverWithControls, type PopoverTargetChildProps } from '../focus-controls/components/popover/popover-with-controls';
import { FocusControlsProvider } from '../focus-controls/provider/focus-controls-provider';
import { useFocusControls } from '../focus-controls/use-focus-controls';
import { Focus } from './provider/use-focus-context';
import { FocusScope } from './scope/focus-scope';

const meta = {
    title: 'UX/Focus',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const FakePanel: React.FC<{ name: string; focusOnMount?: boolean; children: React.ReactNode }> = ({ name, focusOnMount, children }) => {
    // console.log('render panel', id);
    const childScopeId = 'storage-grid-' + name;

    const isInScopeStack = Focus.useIsInScopeStack(childScopeId);

    const { pushScope, popScope } = Focus.usePushPopScope();

    const { focusControlProps, nodeId, focused, active } = useFocusControls<HTMLDivElement>({
        scopeNodeId: name,
        childScopeId,
        focusOnMount,
        controls: [
            getMoveControl({
                label: 'Move',
            }),
            getSelectControl({
                label: 'Select',
                action: () => pushScope(childScopeId),
            }),
            getBackControl({
                label: 'Back',
                action: () => popScope(),
            }),
        ],
    });

    return <Card
        title={`panel name=${name} scopeId=${childScopeId} active=${active} focusOnMount=${focusOnMount}`}
        style={{
            outline: focused
                ? '2px solid red'
                : isInScopeStack
                    ? '2px solid #800'
                    : undefined,
        }}
        {...focusControlProps}
    >
        <FocusScope id={childScopeId} parentNodeId={nodeId}>
            {children}
        </FocusScope>
    </Card>;
};

const FakeItem: React.FC<{
    name: string;
    target?: string;
    onClick?: () => void;
    openModal?: boolean;
    focusOnMount?: boolean;
    children?: React.ReactNode;
} & PopoverTargetChildProps> = ({ name, target, onClick, openModal, focusOnMount, children, ...popoverProps }) => {
    // console.log('render item', id);

    const { pushScope } = Focus.usePushPopScope();

    const { focusControlProps, focused, active } = useFocusControls<HTMLButtonElement>({
        scopeNodeId: name,
        focusOnMount,
        controls: [
            onClick && getSelectControl({
                label: 'Select',
                action: onClick,
            }),
            openModal && getSelectControl({
                label: 'Open modal',
                action: () => focusControlProps.ref.current?.click(),
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

    const ref = useMergedRef(focusControlProps.ref, popoverProps.ref);

    return <Button
        title={`item name=${name} active=${active}`}
        style={{
            color: focused ? undefined : '#FFFA',
            outline: focused ? '2px solid red' : undefined,
        }}
        {...focusControlProps}
        {...popoverProps}
        ref={ref}
    >
        {children ?? name}{target && ` -> ${target}`}
    </Button>;
};

const FakeItemWithGlobalControl: React.FC<{
    name: string;
    focusOnMount?: boolean;
    children?: React.ReactNode;
}> = ({ name, focusOnMount, children }) => {
    // console.log('render item', id);

    const [ special, setSpecial ] = React.useState(false);

    const { focusControlProps, active, focused } = useFocusControls<HTMLButtonElement>({
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

    return <Button
        title={`item name=${name} active=${active}`}
        style={{
            color: focused ? undefined : '#FFFA',
            outline: focused ? '2px solid red' : undefined,
        }}
        {...focusControlProps}
    >
        {children ?? name}{special && ' special pressed'}
    </Button>;
};

const FakeFooter: React.FC = () => {
    const getControls = useAllCurrentControls();

    return <Card>
        <Stack>
            {Object.entries(getControls()).map(([ controlId, controls ]) => <Card key={controlId}>
                <Group>
                    {controlId}<br />
                    {controls.map(c => <Badge
                        key={c.label}
                        leftSection={c.trigger.values.map(value =>
                            getControlIcon(c.trigger.type, value))}
                        size='lg'
                    >
                        {c.label}
                    </Badge>)}
                </Group>
            </Card>)}
        </Stack>
    </Card>;
};

export const Primary: Story = {
    render: () => {
        const [ renderRightPart, setRenderRightPart ] = React.useState(true);
        const [ renderAllItems, setRenderAllItems ] = React.useState(true);
        const [ renderFooter, setRenderFooter ] = React.useState(true);

        return <FocusControlsProvider>
            <Stack align='center' p='xl'>

                <FakePanel name='header'>
                    <Group>
                        <FakeItem name='1' />
                        <FakeItem name='2' />
                        <FakeItem name='3' />
                        <FakeItemWithGlobalControl name='4' />
                    </Group>
                </FakePanel>

                <FakePanel name='1'>
                    <Group>
                        {/* test when focused item unmount */}
                        {renderRightPart && <Card>
                            <FakeItem name='7' />
                            <FakeItem name='8' onClick={() => setRenderRightPart(false)} />
                            <FakeItem name='9' />
                        </Card>}

                        <Card>
                            <FakeItem name='4' />
                            <FakeItem name='5' />
                            <FakeItem name='6' />
                        </Card>
                    </Group>
                </FakePanel>

                <FakePanel name='2'>
                    <Group>
                        <Card>
                            <FakeItem name='4a' />
                            <FakeItem name='5a' />
                            <FakeItem name='6a' />

                            <FakePanel name='2b'>
                                <FakeItem name='5b' />
                                <FakeItem name='6b' />
                            </FakePanel>

                            {/* test programmatic focus on click */}
                            <FakeItem name='t1' target='storage-grid-2b' />
                        </Card>

                        <Card>
                            <FakeItem name='7a' />
                            <FakeItem name='8a' />

                            <PopoverWithControls
                                target={<FakeItem name='9a' openModal />}
                                dropdown={<>
                                    <FakeItem name='p1' />
                                    <FakeItem name='p2' focusOnMount />

                                    <PopoverWithControls
                                        nested
                                        target={<FakeItem name='p3' />}
                                        dropdown={<>
                                            <FakeItem name='pp1' />
                                            <FakeItem name='pp2' focusOnMount />
                                            <FakeItem name='pp3' />
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
                        <FakeItem name='10' />
                        <FakeItem name='11' onClick={() => setRenderAllItems(false)} />
                        <FakeItem name='12' />
                    </Group>}

                </FakePanel>

                {/* test when the whole panel unmount */}
                {renderFooter && <FakePanel name='footer'>
                    <Group>
                        <FakeItem name='13' />
                        <FakeItem name='14' onClick={() => setRenderFooter(false)} />
                        <FakeItem name='15' />
                    </Group>
                </FakePanel>}

                <FakeFooter />
            </Stack>
        </FocusControlsProvider>;
    },
};
