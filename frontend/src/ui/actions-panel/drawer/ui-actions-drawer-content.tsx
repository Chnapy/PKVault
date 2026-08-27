import { Stack, Text, Timeline } from '@mantine/core';
import { SaveIcon, ShieldCheckIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { UIButton } from '../../form/button/ui-button';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UITimelineAction, type UITimelineActionProps } from './ui-timeline-action';

export type UIActionsDrawerContentProps = {
    data: (Pick<UITimelineActionProps, 'type' | 'label' | 'description'> & {
        index: number;
    })[];
    onDelete: UITimelineActionProps[ 'onDelete' ];
    onSave?: () => Promise<unknown>;
};

export const UIActionsDrawerContent: React.FC<UIActionsDrawerContentProps> = ({ data, onDelete, onSave }) => {
    const { t } = useTranslate();

    return <Stack h='100%' style={{ overflow: 'hidden' }}>
        <UISpriteSizeWrapper
            speciesSize='xs'
            component={Timeline}
            bulletSize={16} lineWidth={2} color='red' py='md' style={{
                flexGrow: 1,
                overflow: 'auto',
            }}
        >
            {data.map(({ index, ...rest }) => (
                <UITimelineAction
                    key={index}
                    {...rest}
                    index={index}
                    onDelete={onDelete}
                />
            ))}
        </UISpriteSizeWrapper>

        <Text c='dimmed' mx='auto'>
            <ShieldCheckIcon style={{
                verticalAlign: 'text-bottom',
                marginRight: 4,
            }} />
            {t('storage.save-actions.save.help')}
        </Text>

        <UIButton
            name='actions-save'
            controlLabel={t('action.save')}
            variant='filled'
            color='primary'
            fullWidth
            leftSection={<SaveIcon />}
            onClick={onSave}
            disabled={!onSave}
        >
            {t('action.save')}
        </UIButton>
    </Stack>;
};
