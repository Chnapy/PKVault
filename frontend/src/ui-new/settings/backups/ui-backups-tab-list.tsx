import { Tabs } from '@mantine/core';
import type React from 'react';
import { Focus } from '../../interaction/focus/provider/use-focus-context';
import { ScrollerControlled } from '../../scroller-controlled/scroller-controlled';

type UIBackupsTabListProps = {
    value: string;
    onSelect: (id: string) => void;
    scopeId: string;
    children: React.ReactNode;
};

export const UIBackupsTabList: React.FC<UIBackupsTabListProps> = ({ value, onSelect, scopeId, children }) => {
    const isInScope = Focus.useIsInScopeStack(scopeId);

    return <Tabs
        value={value}
        onChange={tab => tab && onSelect(tab)}
    >
        <Tabs.List>
            <ScrollerControlled id='backups' controlsLabel='Change backups' controlsEnabled={isInScope} level={1}>
                {children}
            </ScrollerControlled>
        </Tabs.List>
    </Tabs>;
};
