import { PencilIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { UIButton } from '../../form/button/ui-button';
import { UIPopoverCard, type UIPopoverCardProps } from './ui-popover-card';

type UIFormCardProps = Omit<UIPopoverCardProps<'form'>, 'footer'> & {
    disabled?: boolean;
};

export const UIFormCard: React.FC<UIFormCardProps> = ({ icon, disabled, ...cardProps }) => {
    const [ loading, setLoading ] = React.useState(false);

    const { t } = useTranslate();

    icon ??= <PencilIcon />;

    const onSubmit: UIFormCardProps[ 'onSubmit' ] = cardProps.onSubmit && (e => {
        const result: unknown = cardProps.onSubmit?.(e);
        if (result instanceof Promise) {
            setLoading(true);
            result.finally(() => setLoading(false));
        }
    });

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
