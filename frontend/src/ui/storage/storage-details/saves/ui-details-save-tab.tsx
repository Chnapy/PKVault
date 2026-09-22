import { Group, Loader, Tabs, Text } from '@mantine/core';
import { AlertCircleIcon, PlusIcon } from 'lucide-react';
import type React from 'react';
import type { UIExpandableTabsData } from '../../../expandable-tabs/ui-expandable-tabs';
import { UIPokedexIcons } from '../../../pokedex/icons/ui-pokedex-icons';

export type UIDetailsSaveTabProps = UIExpandableTabsData
    & {
        imgSrc: string;
        selected: boolean;
        create?: boolean;
        isEnabled?: boolean;
        isMain?: boolean;
        warning?: boolean;
        loading?: boolean;
        ref?: React.Ref<HTMLButtonElement>;
    };

export const UIDetailsSaveTab: React.FC<UIDetailsSaveTabProps> = ({ id, label, imgSrc, selected, create, isEnabled = true, isMain = false, warning = false, loading, ref }) => {
    return <Tabs.Tab
        ref={ref}
        value={id}
        leftSection={<Group gap='xs' wrap='nowrap'>
            {loading
                ? <Loader size='1em' />
                : create && <PlusIcon />}
            <img src={imgSrc} height={16} />
        </Group>}
        disabled={loading}
        pt={4}
    >
        <Group gap='xs' wrap='nowrap'>
            <Text component={selected ? 'b' : undefined} td={isMain ? 'underline' : undefined}>{label}</Text>
            {!isEnabled && <AlertCircleIcon />}
            {warning && isEnabled && <UIPokedexIcons.Warn size='xs' />}
        </Group>
    </Tabs.Tab>;
};
