import { Box, Scroller, Tabs, Text } from '@mantine/core';
import type React from 'react';

export type UIDetailsContentProps = {
    summary?: React.ReactNode;
    stats?: React.ReactNode;
    moves?: React.ReactNode;
    contest?: React.ReactNode;
    origin?: React.ReactNode;
    misc?: React.ReactNode;
};

export const UIDetailsContent: React.FC<UIDetailsContentProps> = ({ summary, stats, moves, contest, origin, misc }) => {

    return <>
        <Tabs defaultValue='summary'>
            <Tabs.List grow>
                <Scroller>
                    {summary && <Tabs.Tab value='summary'>
                        <Text>Summary</Text>
                    </Tabs.Tab>}
                    {stats && <Tabs.Tab value='stats'>
                        <Text>Stats</Text>
                    </Tabs.Tab>}
                    {moves && <Tabs.Tab value='moves'>
                        <Text>Moves</Text>
                    </Tabs.Tab>}
                    {contest && <Tabs.Tab value='contest'>
                        <Text>Contest</Text>
                    </Tabs.Tab>}
                    {origin && <Tabs.Tab value='origin'>
                        <Text>Origin</Text>
                    </Tabs.Tab>}
                    {misc && <Tabs.Tab value='misc'>
                        <Text>Misc</Text>
                    </Tabs.Tab>}
                </Scroller>
            </Tabs.List>

            <Box p='md'>
                {summary && <Tabs.Panel value="summary">
                    {summary}
                </Tabs.Panel>}
                {stats && <Tabs.Panel value="stats">
                    {stats}
                </Tabs.Panel>}
                {moves && <Tabs.Panel value="moves">
                    {moves}
                </Tabs.Panel>}
                {contest && <Tabs.Panel value="contest">
                    {contest}
                </Tabs.Panel>}
                {origin && <Tabs.Panel value="origin">
                    {origin}
                </Tabs.Panel>}
                {misc && <Tabs.Panel value="misc">
                    {misc}
                </Tabs.Panel>}
            </Box>
        </Tabs>
    </>;
};
