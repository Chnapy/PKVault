import { Button, Card, Group, Popover, Stack } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { useFocusNode } from './node/use-focus-node';
import { FocusProvider } from './provider/focus-provider';
import { Focus } from './provider/use-focus-context';
import { FocusScope } from './scope/focus-scope';
import { useFocusScopeContext } from './scope/focus-scope-context';
import { useFocusScope } from './scope/use-focus-scope';

const meta = {
    title: 'UX/Focus',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const FakePanel: React.FC<{ id: string; autoFocus?: boolean; children: React.ReactNode }> = ({ id, autoFocus, children }) => {
    // console.log('render panel', id);
    const scopeId = 'storage-grid-' + id;

    const { enterScope, exitScope } = useFocusScope(scopeId, {
        autoFocus,
    });

    const { ref, focused, active } = useFocusNode<HTMLDivElement>({
        scopeNodeId: id,
        autoFocus,
    });

    React.useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'a':
                    enterScope();
                    break;
                case 'q':
                    exitScope();
                    break;
            }
        };

        if (focused) {
            window.addEventListener('keydown', listener);
        }

        return () => {
            window.removeEventListener('keydown', listener);
        };
    }, [ enterScope, exitScope, focused ]);

    return <Card
        ref={ref}
        title={`panel id=${id} scopeId=${scopeId} active=${active} autoFocus=${autoFocus}`}
        style={{
            outline: focused ? '2px solid red' : undefined,
        }}
    >
        <FocusScope id={scopeId}>
            {children}
        </FocusScope>
    </Card>;
};

const FakeItem: React.FC<{
    id: string;
    autoFocus?: boolean;
    target?: string;
    onClick?: () => void;
    children?: React.ReactNode;
}> = ({ id, autoFocus, target, onClick, children }) => {
    // console.log('render item', id);
    const scopeId = useFocusScopeContext();

    const { exitScope } = useFocusScope(scopeId, {
        autoFocus,
    });
    const { pushScope } = Focus.usePushPopScope();

    if (target) {
        onClick = () => pushScope(target);
    }

    const { ref, active, focused } = useFocusNode<HTMLButtonElement>({
        scopeNodeId: id,
        autoFocus,
    });

    React.useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'a':
                    ref.current?.click();
                    break;
                case 'q':
                    exitScope();
                    break;
            }
        };

        if (focused) {
            window.addEventListener('keydown', listener);
        }

        return () => {
            window.removeEventListener('keydown', listener);
        };
    }, [ exitScope, focused, ref ]);

    return <Button
        ref={ref}
        title={`item id=${id} scopeId=${scopeId} active=${active} autoFocus=${autoFocus}`}
        // disabled={!active}
        style={{
            color: focused ? undefined : '#FFFA',
            outline: focused ? '2px solid red' : undefined,
        }}
        onClick={onClick}
    >
        {children ?? id}{target && ` -> ${target}`}
    </Button>;
};

export const Primary: Story = {
    render: () => {

        const [ renderRightPart, setRenderRightPart ] = React.useState(true);
        const [ renderAllItems, setRenderAllItems ] = React.useState(true);
        const [ renderFooter, setRenderFooter ] = React.useState(true);

        return <FocusProvider initialScope='panels'>
            <FocusScope id="panels">
                <Stack align='center' p='xl'>

                    <FakePanel id='header'>
                        <Group>
                            <FakeItem id='1' />
                            <FakeItem id='2' />
                            <FakeItem id='3' />
                        </Group>
                    </FakePanel>

                    <FakePanel id='1' autoFocus>
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
                                            <FakeItem id='9a' />
                                        </div>
                                    </Popover.Target>

                                    <Popover.Dropdown>
                                        <FakePanel id='popover-1' autoFocus>
                                            <FakeItem id='p1' />
                                            <FakeItem id='p2' />

                                            <Popover>
                                                <Popover.Target>
                                                    <div>
                                                        <FakeItem id='p3' />
                                                    </div>
                                                </Popover.Target>

                                                <Popover.Dropdown>
                                                    <FakePanel id='popover-2' autoFocus>
                                                        <FakeItem id='pp1' />
                                                        <FakeItem id='pp2' />
                                                        <FakeItem id='pp3' />
                                                    </FakePanel>
                                                </Popover.Dropdown>
                                            </Popover>
                                        </FakePanel>
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
                </Stack>
            </FocusScope>
        </FocusProvider>;
    },
};
