import { Grid, Stack } from '@mantine/core';
import type React from 'react';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { FocusScope } from '../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../layout/hooks/use-panel-controls';

type UISettingsContentProps = {
    left: React.ReactNode;
    right: React.ReactNode;
    bottom: React.ReactNode;
};

export const UISettingsContent: React.FC<UISettingsContentProps> = ({ left, right, bottom }) => {

    const { panelProps, nodeId, childScopeId, controlsIcons } = usePanelControls('storage-content', {
        focusOnMount: true,
    });

    return <FocusScope id={childScopeId} parentNodeId={nodeId}>
        <WithControlsIcons placement='out' icons={controlsIcons.open}
            display='flex'
            mah='100%'
            style={{ flexGrow: 1, flexDirection: 'column', flexWrap: 'nowrap', }}
            {...panelProps}
        >
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
        </WithControlsIcons>
    </FocusScope>;
};
