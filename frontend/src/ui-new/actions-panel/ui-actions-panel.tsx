import { Button, Card, Divider, Group, OverflowList, Title } from '@mantine/core';
import { SaveIcon } from 'lucide-react';
import type React from 'react';
import { FocusScope } from '../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../layout/hooks/use-panel-controls';
import { UIAction, type UIActionProps } from './ui-action';

export type UIActionsPanelProps = {
    data: UIActionProps[];
};

export const UIActionsPanel: React.FC<UIActionsPanelProps> = ({ data }) => {

    const { panelProps, nodeId, childScopeId } = usePanelControls('actions');

    return <Card
        orientation='horizontal'
        p='sm'
        pl='md'
        {...panelProps}
    >
        <FocusScope id={childScopeId} parentNodeId={nodeId}>
            <Group wrap='nowrap' style={{ flexGrow: 1 }}>
                <Title order={5} lh={1}>Actions<br />to save</Title>

                <Divider orientation='vertical' mr='auto' />

                <OverflowList
                    data={data}
                    display='flex'
                    gap='md'
                    style={{ alignItems: 'center' }}
                    renderItem={(props, i) => <UIAction key={i} {...props} />}
                    renderOverflow={(items) => <Button
                        size='compact-md'
                    >
                        + {items.length} actions
                    </Button>}
                />

                <Divider orientation='vertical' />

                <Button
                    variant='filled'
                    color='primary'
                    size='compact-md'
                    pl='md'
                    pr='lg'
                    disabled={data.length === 0}
                    leftSection={<SaveIcon />}
                >
                    Save
                </Button>
            </Group>
        </FocusScope>
    </Card>
};
