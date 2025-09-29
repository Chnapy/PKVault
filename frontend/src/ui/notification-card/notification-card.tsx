import React from 'react';
import { BackendErrorsContext } from '../../data/backend-errors-context';
import { useWarningsGetWarnings } from '../../data/sdk/warnings/warnings.gen';
import { useTranslate } from '../../translate/i18n';
import { PkmVersionWarning } from '../../warnings/pkm-version-warning';
import { Button } from '../button/button';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';
import { theme } from '../theme';

export const NotificationCard: React.FC = () => {
    const { t } = useTranslate();
    const { errors, removeIndex } = BackendErrorsContext.useValue();

    const warnings = useWarningsGetWarnings().data?.data;

    const nbrWarnings = warnings ? (warnings.pkmVersionWarnings.length + warnings.playTimeWarnings.length) : 0;

    const hasErrorsAndWarnings = errors.length > 0 && nbrWarnings > 0;

    const title = [
        nbrWarnings > 0 && t('notifications.warnings', { count: nbrWarnings }),
        errors.length > 0 && t('notifications.errors', { count: errors.length }),
    ].filter(Boolean).join(' / ');

    return <TitledContainer
        contrasted
        maxHeight={300}
        title={<div
            style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
            }}
        >
            <Icon name='angle-down' forButton />
            {title}
            <Icon name='angle-down' forButton />
        </div>}
    >
        <table style={{ wordBreak: 'break-word' }}>
            <tbody>
                {/* {warnings?.playTimeWarnings.map(warn => <div key={warn.saveId}>
                            Issue with save {warn.saveId}, current save seems to have less play-time than previous one
                        </div>)} */}

                {warnings?.pkmVersionWarnings.map((warn, i) => <PkmVersionWarning key={i} {...warn} />)}

                {hasErrorsAndWarnings && <tr><td><hr /></td></tr>}

                {errors.map((error, i) => {
                    return <tr key={i}>
                        <td>
                            <details>
                                <summary style={{ cursor: 'pointer' }}>{error.message}</summary>

                                <code style={{
                                    display: 'flex',
                                    fontSize: '75%',
                                    // lineBreak: 'anywhere',
                                    backgroundColor: theme.bg.contrastdark,
                                    padding: 4,
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                }}>
                                    {error.stack}
                                </code>
                            </details>
                        </td>
                        <td style={{ verticalAlign: 'top' }}>
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
