import { Box, Grid, Splitter, useMatches } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
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

    const [ speciesSizeRaw ] = useSpriteSizeLocalStorage('storage-sprite-size');

    const viewport = useViewportSize();

    // dynamic speciesSize for given viewport
    const getViewportSpeciesSize = () => {
        const containerWidth = viewport.width / 2 - 42.2;
        const nbrItemsPerLine = 6;
        const gapPx = 4;
        const gapPerItem = gapPx * (nbrItemsPerLine - 1) / nbrItemsPerLine;
        const itemWidth = containerWidth / nbrItemsPerLine - gapPerItem;
        const spriteInitialWidth = 96;

        return itemWidth / spriteInitialWidth;
    };

    const speciesSize = useMatches({
        base: 0.5,
        xs: 0.75,
        sm: getViewportSpeciesSize(),
        // md: 0.75,
        lg: speciesSizeRaw,
    });

    const getResponsiveContent = useMatches({
        base: () => <Splitter orientation='vertical' w='100%' lineSize={'var(--mantine-spacing-sm)'} styles={{ thumb: { width: 200 } }}>
            <Splitter.Pane defaultSize={50} min='20px' collapsible>
                <PanelProvider value='left'>
                    {left}
                </PanelProvider>
            </Splitter.Pane>
            <Splitter.Pane defaultSize={50} min='20px' collapsible>
                <PanelProvider value='right'>
                    {right}
                </PanelProvider>
            </Splitter.Pane>
        </Splitter>,
        sm: () => <>
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
        </>,
    });

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
                        {getResponsiveContent()}
                    </CurrentPanelProvider>
                </UISpriteSizeWrapper>
            </FocusScope>
        </WithControlsIcons>
    );
};
