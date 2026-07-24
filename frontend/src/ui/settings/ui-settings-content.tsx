import { Grid, Stack } from '@mantine/core';
import type React from 'react';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { FocusScope } from '../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../layout/hooks/use-panel-controls';

type UISettingsContentProps = Pick<React.DOMAttributes<HTMLFormElement>, 'onSubmit'> & {
    left: React.ReactNode;
    right: React.ReactNode;
    bottom: React.ReactNode;
};

export const UISettingsContent: React.FC<UISettingsContentProps> = ({ left, right, bottom, onSubmit }) => {

    const { panelProps, nodeId, childScopeId, controlIcons } = usePanelControls('settings-content');

    return <FocusScope id={childScopeId} parentNodeId={nodeId}>
        <WithControlsIcons placement='out' icons={controlIcons('open')}
            as='form'
            onSubmit={onSubmit as never}
            style={{
                flexGrow: 1,
                maxHeight: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                gap: 'var(--mantine-spacing-md)',
                borderRadius: 'var(--mantine-radius-md)',
            }}
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
