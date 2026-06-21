import { Box, Group, Tabs, Text } from '@mantine/core';
import { AlertTriangleIcon } from 'lucide-react';
import React from 'react';
import { Focus } from '../../../interaction/focus/provider/use-focus-context';
import { useFocusScopeContext } from '../../../interaction/focus/scope/use-focus-scope-context';
import { ScrollerControlled } from '../../../scroller-controlled/scroller-controlled';

export type UIDetailsContentProps = {
    issues?: React.ReactNode;
    summary?: React.ReactNode;
    stats?: React.ReactNode;
    moves?: React.ReactNode;
    contest?: React.ReactNode;
    origin?: React.ReactNode;
    misc?: React.ReactNode;
};

export const UIDetailsContent: React.FC<UIDetailsContentProps> = ({ issues, summary, stats, moves, contest, origin, misc }) => {
    const parentScope = useFocusScopeContext();
    const scopeActive = Focus.useIsScopeActive(parentScope.scopeId);

    const ref = React.useRef<HTMLDivElement>(null);

    const onTabClick: React.MouseEventHandler<HTMLButtonElement> = e => {
        e.currentTarget.scrollIntoView({
            behavior: 'instant',
            block: 'center',
            inline: 'center',
        });
    };

    React.useEffect(() => {
        if (!ref.current || ref.current.querySelector('button[role="tab"][data-active="true"]'))
            return;

        const firstTab = ref.current.querySelector<HTMLButtonElement>('button[role="tab"]:not([data-disabled="true"])');
        firstTab?.click();
    });

    return <Tabs defaultValue={issues ? 'issues' : 'summary'} mah='100%' style={{
        display: 'flex',
        flexDirection: 'column',
    }}>
        <Tabs.List ref={ref} grow>
            <ScrollerControlled id='details-content' level={1} controlsEnabled={scopeActive} controlsLabel='Change details content'>
                {issues && <Tabs.Tab value='issues' onClick={onTabClick}>
                    <Text component={Group} wrap='nowrap' gap='sm'><AlertTriangleIcon /> Issues</Text>
                </Tabs.Tab>}
                {summary && <Tabs.Tab value='summary' onClick={onTabClick}>
                    <Text>Summary</Text>
                </Tabs.Tab>}
                {stats && <Tabs.Tab value='stats' onClick={onTabClick}>
                    <Text>Stats</Text>
                </Tabs.Tab>}
                {moves && <Tabs.Tab value='moves' onClick={onTabClick}>
                    <Text>Moves</Text>
                </Tabs.Tab>}
                {contest && <Tabs.Tab value='contest' onClick={onTabClick}>
                    <Text>Contest</Text>
                </Tabs.Tab>}
                {origin && <Tabs.Tab value='origin' onClick={onTabClick}>
                    <Text>Origin</Text>
                </Tabs.Tab>}
                {misc && <Tabs.Tab value='misc' onClick={onTabClick}>
                    <Text>Misc</Text>
                </Tabs.Tab>}
            </ScrollerControlled>
        </Tabs.List>

        <Box p='md' style={{ overflow: 'auto' }}>
            {issues && <Tabs.Panel value="issues">
                {issues}
            </Tabs.Panel>}
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
    </Tabs>;
};
