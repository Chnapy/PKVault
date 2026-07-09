import { Divider, Group, Indicator, Timeline } from '@mantine/core';
import { TrashIcon } from 'lucide-react';
import type React from 'react';
import { DataActionType } from '../../../data/sdk/model';
import { UIActionIcon } from '../../form/button/ui-action-icon';
import { usePopover } from '../../interaction/focus-controls/components/popover/hooks/use-popover';
import { UIConfirmPopover } from '../../popover/ui-confirm-popover';
import { useActionLabel } from '../hooks/use-action-label';
import { getActionColor } from '../utils/get-action-color';

export type UITimelineActionProps = {
    type: DataActionType;
    description: string;
    index: number;
    onDelete: (index: number) => Promise<unknown>;
};

export const UITimelineAction: React.FC<UITimelineActionProps> = ({ type, description, index, onDelete }) => {
    const popover = usePopover();
    const getLabel = useActionLabel();

    return <Timeline.Item
        title={<Group>
            {getLabel(type)}

            <Divider style={{ flexGrow: 1 }} />

            <UIConfirmPopover
                label={'Delete'}
                description={'Delete this action and all next ones'}
                color='red'
                action={async () => {
                    await onDelete(index);
                    if (index === 0)
                        popover?.setOpened(false);
                }}
            >
                <UIActionIcon
                    variant='filled'
                    color='red'
                    p={0}
                    name={`action-${index}`}
                    controlLabel={`Action ${index}`}
                    disabled={([
                        DataActionType.DATA_NORMALIZE,
                        DataActionType.UPDATE_EXTERNAL_PKM,
                    ] as DataActionType[]).includes(type)}
                    h='1rem'
                    mt={-8}
                >
                    <TrashIcon />
                </UIActionIcon>
            </UIConfirmPopover>
        </Group>}
        bullet={<Indicator inline processing color={getActionColor(type)} />}
    >
        {description}
    </Timeline.Item>;
};
