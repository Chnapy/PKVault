import { Box, Grid } from '@mantine/core';
import type React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../../layout/hooks/use-panel-controls';
import { useSpriteSizeLocalStorage } from '../../local-storage/use-storage-size-local-storage';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { CurrentPanelProvider } from './context/ui-current-panel-provider';
import { PanelProvider } from './context/ui-panel-context';

type UIStorageContentProps = {
    id?: string;
    left: React.ReactNode;
    right: React.ReactNode;
    middle: React.ReactNode;
};

export const UIStorageContent: React.FC<UIStorageContentProps> = ({ id, left, right, middle }) => {

    const { panelProps, nodeId, childScopeId, controlIcons } = usePanelControls('storage-content');

    const [ speciesSize ] = useSpriteSizeLocalStorage('storage-sprite-size');

    return (
        <WithControlsIcons placement='out' icons={controlIcons('open')}
            mah='100%'
            mih={0}
            display='flex'
            style={{ flexGrow: 1, }}
        >
            <FocusScope id={childScopeId} parentNodeId={nodeId}>
                <UISpriteSizeWrapper
                    speciesSize={speciesSize}
                    component={Grid}
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

                        <Box w='calc(var(--grid-column-gap) * 2)' py='md' mx='calc(var(--grid-column-gap) * -1)'>
                            {middle}
                        </Box>

                        <Grid.Col span={6}>
                            <PanelProvider value='right'>
                                {right}
                            </PanelProvider>
                        </Grid.Col>
                    </CurrentPanelProvider>
                </UISpriteSizeWrapper>
            </FocusScope>
        </WithControlsIcons>
    );
};
