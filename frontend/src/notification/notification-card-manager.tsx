import { css } from '@emotion/css';
import React from 'react';
import { BackendErrorsContext } from '../data/backend-errors-context';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { HasUpdateWarning } from './warnings/has-update-warning';
import { useCheckUpdate } from './hooks/use-check-update';
import { PkmVersionWarning } from './warnings/pkm-version-warning';
import { SaveChangedWarning } from './warnings/save-changed-warning';
import { SaveDuplicateWarning } from './warnings/save-duplicate-warning';
import { Button } from '../ui/button/button';
import { Icon } from '../ui/icon/icon';
import { theme } from '../ui/theme';
import { NotificationCard } from '../ui/notification-card/notification-card';

export const NotificationCardManager: React.FC = () => {
    const { errors, removeIndex } = BackendErrorsContext.useValue();

    const hasUpdate = !!useCheckUpdate();
    const warnings = useWarningsGetWarnings().data?.data;

    return <NotificationCard
        warningsCount={warnings?.warningsCount ?? 0}
        errorsCount={errors.length}
        update={hasUpdate && <HasUpdateWarning />}
        saveDuplicateWarnings={warnings?.saveDuplicateWarnings.map((warn, i) => <SaveDuplicateWarning key={i} {...warn} />)}
        pkmVersionWarnings={warnings?.pkmVersionWarnings.map((warn, i) => <PkmVersionWarning key={i} {...warn} />)}
        saveChangedWarnings={warnings?.saveChangedWarnings.map((warn, i) => <SaveChangedWarning key={i} {...warn} />)}
        errors={errors.map((error, i) => {
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
    />;
};
