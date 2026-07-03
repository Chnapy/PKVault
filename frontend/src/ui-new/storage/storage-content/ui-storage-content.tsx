import { Grid } from '@mantine/core';
import type React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../../layout/hooks/use-panel-controls';
import { CurrentPanelProvider } from './context/ui-current-panel-provider';
import { PanelProvider } from './context/ui-panel-context';

type UIStorageContentProps = {
    id?: string;
    left: React.ReactNode;
    right: React.ReactNode;
};

export const UIStorageContent: React.FC<UIStorageContentProps> = ({ id, left, right }) => {

    const { panelProps, nodeId, childScopeId, controlIcons } = usePanelControls('storage-content');

    return (
        <WithControlsIcons placement='out' icons={controlIcons('open')}
            mah='100%'
            mih={0}
            display='flex'
            style={{ flexGrow: 1, }}
        >
            <FocusScope id={childScopeId} parentNodeId={nodeId}>
                <Grid
                    id={id}
                    w='100%'
                    bdrs='md'
                    {...panelProps}
                    styles={{
                        inner: {
                            height: '100%',
                            flexWrap: 'nowrap',
                        }
                    }}
                >
                    <CurrentPanelProvider initialValue='left'>
                        <Grid.Col span={6}>
                            <PanelProvider value='left'>
                                {left}
                            </PanelProvider>
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <PanelProvider value='right'>
                                {right}
                            </PanelProvider>
                        </Grid.Col>
                    </CurrentPanelProvider>
                </Grid>
            </FocusScope>
        </WithControlsIcons>
    );
};
