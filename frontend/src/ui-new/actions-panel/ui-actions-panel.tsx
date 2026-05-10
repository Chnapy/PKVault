import { Button, Card, Divider, Group, OverflowList, Title } from '@mantine/core';
import type React from 'react';
import { UIAction, type UIActionProps } from './ui-action';

export type UIActionsPanelProps = {
    data: UIActionProps[];
};

export const UIActionsPanel: React.FC<UIActionsPanelProps> = ({ data }) => {

    return <Card
        orientation='horizontal'
        p='sm'
        pl='md'
    >
        <Group wrap='nowrap' style={{ flexGrow: 1 }}>
            <Title order={6} lh={1}>Actions<br />to save</Title>

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
                px='xl'
                disabled={data.length === 0}
            >
                Save
            </Button>
        </Group>
    </Card>
};
