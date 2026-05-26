import { Tabs } from '@mantine/core';
import { SettingsIcon } from 'lucide-react';
import type React from 'react';
import { ScrollerControlled } from '../../scroller-controlled/scroller-controlled';
import { useCurrentPanel } from '../../storage/storage-content/context/ui-panel-context';

export type UISettingsTabListProps = {
    value: string;
    onSelect: (id: string) => void;
    children: React.ReactNode;
};

export const UISettingsTabList: React.FC<UISettingsTabListProps> = ({ value, onSelect, children }) => {
    const { isInCurrentPanel } = useCurrentPanel();

    return <Tabs
        variant="pills"
        value={value}
        onChange={tab => tab && onSelect(tab)}
        __vars={{
            '--mantine-color-body': 'var(--mantine-color-primary-7)',
        }}
    >
        <Tabs.List
            style={{
                flexGrow: 1,
                alignItems: 'center',
                flexWrap: 'nowrap',
                gap: 'var(--mantine-spacing-md)',
            }}
        >
            <SettingsIcon />

            <ScrollerControlled id='settings' controlsLabel='Change category' controlsEnabled={isInCurrentPanel} level={2}>
                {children}
            </ScrollerControlled>
        </Tabs.List>
    </Tabs>;
};
