import { Grid, Stack } from '@mantine/core';
import type React from 'react';
import { FocusScope } from '../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../layout/hooks/use-panel-controls';

type UISettingsContentProps = {
    left: React.ReactNode;
    right: React.ReactNode;
    bottom: React.ReactNode;
};

export const UISettingsContent: React.FC<UISettingsContentProps> = ({ left, right, bottom }) => {

    const { panelProps, nodeId, childScopeId } = usePanelControls('storage-content', {
        focusOnMount: true,
    });

    return <FocusScope id={childScopeId} parentNodeId={nodeId}>
        <Grid
            mah='100%'
            overflow='hidden'
            style={{ flexGrow: 1 }}
            bdrs='md'
            styles={{
                inner: {
                    maxHeight: '100%',
                    flexWrap: 'nowrap',
                },
            }}
            {...panelProps}
        >
            <Grid.Col span={4}>
                <Stack mah='100%'>
                    {left}
                </Stack>
            </Grid.Col>

            <Grid.Col span={8}>
                <Stack mah='100%'>
                    {right}
                </Stack>
            </Grid.Col>
        </Grid>

        {bottom}
    </FocusScope>;
};
