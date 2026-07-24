import { Stack, Timeline } from '@mantine/core';
import { SaveIcon } from 'lucide-react';
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
                overflow: 'auto'
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
