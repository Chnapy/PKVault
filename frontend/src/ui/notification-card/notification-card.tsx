import React from 'react';
import { BackendErrorsContext } from '../../data/backend-errors-context';
import { useWarningsGetWarnings } from '../../data/sdk/warnings/warnings.gen';
import { useTranslate } from '../../translate/i18n';
import { HasUpdateWarning } from '../../warnings/has-update-warning';
import { useCheckUpdate } from '../../warnings/hooks/use-check-update';
import { PkmVersionWarning } from '../../warnings/pkm-version-warning';
import { SaveChangedWarning } from '../../warnings/save-changed-warning';
import { SaveDuplicateWarning } from '../../warnings/save-duplicate-warning';
import { Button } from '../button/button';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';
import { theme } from '../theme';
import { css } from '@emotion/css';

export const NotificationCard: React.FC = () => {
    const { t } = useTranslate();
    const { errors, removeIndex } = BackendErrorsContext.useValue();

    const hasUpdate = !!useCheckUpdate();
    const warnings = useWarningsGetWarnings().data?.data;

    const nbrWarnings = warnings?.warningsCount ?? 0;

    const hasErrorsAndWarnings = errors.length > 0 && (nbrWarnings > 0 || hasUpdate);

    const title = [
        nbrWarnings > 0 && t('notifications.warnings', { count: nbrWarnings }),
        errors.length > 0 && t('notifications.errors', { count: errors.length }),
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
                {hasUpdate && <HasUpdateWarning />}

                {warnings?.saveDuplicateWarnings.map((warn, i) => <SaveDuplicateWarning key={i} {...warn} />)}

                {warnings?.pkmVersionWarnings.map((warn, i) => <PkmVersionWarning key={i} {...warn} />)}

                {warnings?.saveChangedWarnings.map((warn, i) => <SaveChangedWarning key={i} {...warn} />)}

                {hasErrorsAndWarnings && <tr><td><hr /></td></tr>}

                {errors.map((error, i) => {
                    return <tr key={i}>
                        <td>
                            <details>
                                <summary className={css({ cursor: 'pointer' })}>{error.message}</summary>

                                <code className={css({
                                    display: 'flex',
                                    fontSize: '75%',
                                    backgroundColor: theme.bg.contrastdark,
                                    padding: 4,
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                })}>
                                    {error.stack}
                                </code>
                            </details>
                        </td>
                        <td className={css({ verticalAlign: 'top' })}>
                            <Button onClick={() => removeIndex(i)}>
                                <Icon name='times' forButton />
                            </Button>
                        </td>
                    </tr>;
                })}
            </tbody>
        </table>
    </TitledContainer>
};
