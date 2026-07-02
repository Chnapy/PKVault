import { Group, Tabs, Text } from '@mantine/core';
import { AlertCircleIcon, AlertTriangleIcon, PlusIcon } from 'lucide-react';
import type React from 'react';
import type { UIExpandableTabsData } from '../../../expandable-tabs/ui-expandable-tabs';
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
    };

export const UIDetailsSaveTab: React.FC<UIDetailsSaveTabProps> = ({ id, label, version, selected, create, color, isEnabled = true, isMain = false, warning = false }) => {

    return <Tabs.Tab
        value={id}
        leftSection={<Group gap='xs'>
            {create && <PlusIcon />}
            <UIGameImg version={version} size='1lh' />
        </Group>}
    >
        <Group gap='xs' wrap='nowrap'>
            <Text component={selected ? 'b' : undefined} td={isMain ? 'underline' : undefined}>{label}</Text>
            {!isEnabled && <AlertCircleIcon />}
            {warning && isEnabled && <AlertTriangleIcon />}
        </Group>
    </Tabs.Tab>;
};
