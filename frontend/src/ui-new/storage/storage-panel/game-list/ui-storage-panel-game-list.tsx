import { ActionIcon, Group, Tabs, Text } from '@mantine/core';
import { CirclePlusIcon } from 'lucide-react';
import type React from 'react';
import { UIExpandableTabs } from '../../../expandable-tabs/ui-expandable-tabs';
import { Focus } from '../../../interaction/focus/provider/use-focus-context';
import { useFocusScopeContext } from '../../../interaction/focus/scope/use-focus-scope-context';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import { UIGameExpanded, type UIGameData } from './ui-game-expanded';

export type UIStoragePanelGameListProps = {
    value: string;
    data: UIGameData[];
    onChange: (id: string) => void;
};

export const UIStoragePanelGameList: React.FC<UIStoragePanelGameListProps> = ({ value, data, onChange }) => {
    const parentScope = useFocusScopeContext();
    const scopeActive = Focus.useIsScopeActive(parentScope.scopeId);

    const { isInCurrentPanel } = useCurrentPanel();

    return <UIExpandableTabs
        id='games'
        level={2}
        controlsEnabled={scopeActive && isInCurrentPanel}
        controlsLabel='Change game'
        value={value}
        data={data}
        onChange={onChange}
        renderTab={({ item, selected }) => <Tabs.Tab key={item.id} value={item.id} leftSection={<img src={item.imgSrc} height={16} />} py={4}>
            <Text component={selected ? 'b' : undefined}>{item.label}</Text>
        </Tabs.Tab>}
        renderExpanded={(data, { reduce }) => <Group
            p='md'
            pt={0}
        >
            {data.map(({ item, selected }) => <UIGameExpanded
                key={item.id}
                {...item}
                selected={selected}
                onSelect={() => {
                    onChange(item.id);
                    reduce();
                }}
            />)}

            <ActionIcon
                variant='default'
                size='xl'
            >
                <CirclePlusIcon />
            </ActionIcon>
        </Group>}
    />;
};
