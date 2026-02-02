import { css } from '@emotion/css';
import React from 'react';
import { useTranslate } from '../../translate/i18n';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';

export type NotificationCardProps = {
    warningsCount: number;
    errorsCount: number;
    update: React.ReactNode;
    saveDuplicateWarnings: React.ReactNode;
    pkmVariantWarnings: React.ReactNode;
    saveChangedWarnings: React.ReactNode;
    errors: React.ReactNode;
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
    warningsCount, errorsCount, update, saveDuplicateWarnings, pkmVariantWarnings, saveChangedWarnings, errors
}) => {
    const { t } = useTranslate();

    const hasErrorsAndWarnings = errorsCount > 0 && (warningsCount > 0 || !!update);

    const title = [
        warningsCount > 0 && t('notifications.warnings', { count: warningsCount }),
        errorsCount > 0 && t('notifications.errors', { count: errorsCount }),
    ].filter(Boolean).join(' / ');

    return <TitledContainer
        contrasted
        maxHeight={300}
        title={title && <div
            className={css({
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
            })}
        >
            <Icon name='angle-down' forButton />
            {title}
            <Icon name='angle-down' forButton />
        </div>}
    >
        <table className={css({ wordBreak: 'break-word' })}>
            <tbody>
                {update}

                {saveDuplicateWarnings}
                {pkmVariantWarnings}
                {saveChangedWarnings}

                {hasErrorsAndWarnings && <tr><td><hr /></td></tr>}

                {errors}
            </tbody>
        </table>
    </TitledContainer>
};
