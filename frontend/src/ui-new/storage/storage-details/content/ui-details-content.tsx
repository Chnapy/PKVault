import { Box, Group, Tabs, Text } from '@mantine/core';
import React from 'react';
import { Focus } from '../../../interaction/focus/provider/use-focus-context';
import { useFocusScopeContext } from '../../../interaction/focus/scope/use-focus-scope-context';
import { ScrollerControlled } from '../../../scroller-controlled/scroller-controlled';

type DetailsContentItem = {
    name: string;
    label: React.ReactNode;
    content: React.ReactNode;
};

export type UIDetailsContentProps = {
    content: DetailsContentItem[];
};

export const UIDetailsContent: React.FC<UIDetailsContentProps> = ({ content }) => {
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

    return <Tabs defaultValue={content[ 0 ]?.name} mah='100%' style={{
        display: 'flex',
        flexDirection: 'column',
    }}>
        <Tabs.List ref={ref} grow>
            <ScrollerControlled id='details-content' level={1} controlsEnabled={scopeActive} controlsLabel='Change details content'>
                {content.map(item => <Tabs.Tab key={item.name} value={item.name} onClick={onTabClick}>
                    <Text component={Group} wrap='nowrap' gap='sm'>{item.label}</Text>
                </Tabs.Tab>)}
            </ScrollerControlled>
        </Tabs.List>

        <Box p='md' style={{ overflow: 'auto' }}>
            {content.map(item => <Tabs.Panel key={item.name} value={item.name}>
                {item.content}
            </Tabs.Panel>)}
        </Box>
    </Tabs>;
};
