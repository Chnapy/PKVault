import { Group, Loader, Tabs, Text } from '@mantine/core';
import { AlertCircleIcon, PlusIcon } from 'lucide-react';
import type React from 'react';
import type { UIExpandableTabsData } from '../../../expandable-tabs/ui-expandable-tabs';
import { UIPokedexIcons } from '../../../pokedex/icons/ui-pokedex-icons';
import { UIGameImg, type UIGameImgProps } from '../../../sprite-img/ui-game-img';

type UIDetailsSaveTabProps = UIExpandableTabsData
    & Pick<UIGameImgProps, 'version'>
    & {
        selected: boolean;
        create?: boolean;
        color: string;
        isEnabled?: boolean;
        isMain?: boolean;
        warning?: boolean;
        loading?: boolean;
        ref?: React.Ref<HTMLButtonElement>;
    };

export const UIDetailsSaveTab: React.FC<UIDetailsSaveTabProps> = ({ id, label, version, selected, create, color, isEnabled = true, isMain = false, warning = false, loading, ref }) => {
    return <Tabs.Tab
        ref={ref}
        value={id}
        leftSection={<Group gap='xs' wrap='nowrap'>
            {loading
                ? <Loader size='1em' />
                : create && <PlusIcon />}
            <UIGameImg version={version} size='1lh' />
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
