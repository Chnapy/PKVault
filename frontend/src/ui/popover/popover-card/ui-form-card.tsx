import { PencilIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { useClickLoading } from '../../form/button/hooks/use-click-loading';
import { UIButton } from '../../form/button/ui-button';
import { UIPopoverCard, type UIPopoverCardProps } from './ui-popover-card';

type UIFormCardProps = Omit<UIPopoverCardProps<'form'>, 'footer'> & {
    disabled?: boolean;
};

export const UIFormCard: React.FC<UIFormCardProps> = ({ icon, disabled, ...cardProps }) => {
    const { onClick: onSubmit, loading } = useClickLoading(cardProps.onSubmit);

    const { t } = useTranslate();

    icon ??= <PencilIcon />;

    return <UIPopoverCard<'form'>
        {...cardProps}
        component='form'
        onSubmit={onSubmit}
        icon={icon}
        footer={
            <UIButton
                name='submit'
                controlLabel={t('action.submit')}
                type='submit'
                disabled={disabled}
                variant='filled'
                color='blue'
                w='100%'
                leftSection={icon}
                loading={loading}
            >
                {t('action.submit')}
            </UIButton>
        }
    />;
};
