import { Group, Stack, Timeline } from '@mantine/core';
import { SaveIcon, SortDescIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { UIButton } from '../../form/button/ui-button';
import { UITimelineAction, type UITimelineActionProps } from './ui-timeline-action';

export type UIActionsDrawerContentProps = {
    data: Pick<UITimelineActionProps, 'type' | 'description'>[];
    onDelete: UITimelineActionProps[ 'onDelete' ];
    onSave?: () => Promise<unknown>;
};

export const UIActionsDrawerContent: React.FC<UIActionsDrawerContentProps> = ({ data, onDelete, onSave }) => {
    const { t } = useTranslate();

    return <Stack h='100%' style={{ overflow: 'hidden' }}>
        <Timeline bulletSize={16} lineWidth={2} color='red' py='md' style={{
            overflow: 'auto'
        }}>
            {data.map((props, i) => (
                <UITimelineAction
                    key={i}
                    {...props}
                    index={i}
                    onDelete={onDelete}
                />
            ))}
        </Timeline>
        <Group>
            <SortDescIcon />
            Most recent last
        </Group>

        <UIButton
            name='actions-save'
            controlLabel='Save actions'
            variant='filled'
            color='primary'
            fullWidth
            mt='auto'
            leftSection={<SaveIcon />}
            onClick={onSave}
        >
            {t('action.save')}
        </UIButton>
    </Stack>;
};
