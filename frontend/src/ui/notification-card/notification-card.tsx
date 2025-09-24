import React from 'react';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';
import { BackendErrorsContext } from '../../data/backend-errors-context';
import { Button } from '../button/button';
import { theme } from '../theme';
import { useWarningsGetWarnings } from '../../data/sdk/warnings/warnings.gen';
import { PkmVersionWarning } from '../../warnings/pkm-version-warning';

export const NotificationCard: React.FC = () => {
    const { errors, removeIndex } = BackendErrorsContext.useValue();

    const warnings = useWarningsGetWarnings().data?.data;

    const nbrWarnings = warnings ? (warnings.pkmVersionWarnings.length + warnings.playTimeWarnings.length) : 0;

    const hasErrorsAndWarnings = errors.length > 0 && nbrWarnings > 0;

    const title = [
        errors.length > 0 && `${errors.length} errors`,
        nbrWarnings > 0 && `${nbrWarnings} warnings`,
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
