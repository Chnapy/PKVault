import { Box, Tabs, Text } from '@mantine/core';
import type React from 'react';
import { Focus } from '../../../interaction/focus/provider/use-focus-context';
import { useFocusScopeContext } from '../../../interaction/focus/scope/use-focus-scope-context';
import { ScrollerControlled } from '../../../scroller-controlled/scroller-controlled';

export type UIPokedexDetailsContentProps = {
    stats?: React.ReactNode;
    moves?: React.ReactNode;
    locations?: React.ReactNode;
    evolutions?: React.ReactNode;
    misc?: React.ReactNode;
};

export const UIPokedexDetailsContent: React.FC<UIPokedexDetailsContentProps> = ({ stats, moves, locations, evolutions, misc }) => {
    const parentScope = useFocusScopeContext();
    const scopeActive = Focus.useIsScopeActive(parentScope.scopeId);

    return <>
        <Tabs defaultValue='summary'>
            <Tabs.List grow>
                <ScrollerControlled id='details-content' level={1} controlsEnabled={scopeActive} controlsLabel='Change details content'>
                    {stats && <Tabs.Tab value='stats'>
                        <Text>Stats</Text>
                    </Tabs.Tab>}
                    {moves && <Tabs.Tab value='moves'>
                        <Text>Moves</Text>
                    </Tabs.Tab>}
                    {locations && <Tabs.Tab value='locations'>
                        <Text>Locations</Text>
                    </Tabs.Tab>}
                    {evolutions && <Tabs.Tab value='evolutions'>
                        <Text>Evolutions</Text>
                    </Tabs.Tab>}
                    {misc && <Tabs.Tab value='misc'>
                        <Text>Misc</Text>
                    </Tabs.Tab>}
                </ScrollerControlled>
            </Tabs.List>

            <Box p='md'>
                <Tabs.Panel value="stats">
                    {stats}
                </Tabs.Panel>
                <Tabs.Panel value="moves">
                    {moves}
                </Tabs.Panel>
                <Tabs.Panel value="locations">
                    {locations}
                </Tabs.Panel>
                <Tabs.Panel value="evolutions">
                    {evolutions}
                </Tabs.Panel>
                <Tabs.Panel value="misc">
                    {misc}
                </Tabs.Panel>
            </Box>
        </Tabs>
    </>;
};
