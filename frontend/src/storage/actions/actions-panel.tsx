import React from 'react';
import { useStorageDeleteActions, useStorageGetActions, useStorageSave } from '../../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../../error/with-error-catcher';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { TitledContainer } from '../../ui/container/titled-container';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { useActionDescription } from './hooks/use-action-description';

export const ActionsPanel: React.FC = withErrorCatcher('default', () => {
    const { t } = useTranslate();

    const actionsQuery = useStorageGetActions();
    const actionsDeleteMutation = useStorageDeleteActions();
    const saveMutation = useStorageSave();

    const getActionDescription = useActionDescription();

    const [ actionIndexToRemoveFrom, setActionIndexToRemoveFrom ] = React.useState<number>();

    const actions = actionsQuery.data?.data ?? [];

    const nbrSelectedActions = actionIndexToRemoveFrom === undefined ? 0 : (actions.length - actionIndexToRemoveFrom);

    const expanded = actions.length > 0 ? undefined : false;

    return <TitledContainer
        contrasted
        enableExpand
        expanded={expanded}
        title={<div
            style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
            }}
        >
            <Icon name='angle-down' forButton />
            {t('storage.save-actions.title', { count: actions.length })}
            <Icon name='angle-down' forButton />
        </div>}
    >
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}
        >
            <div style={{
                maxHeight: 300,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 4
                }}>
                    <Icon name='info-circle' solid forButton />
                    {t('storage.save-actions.help')}
                </div>

                <table>
                    <tbody>
                        {actions.map((action, i) => {
                            const selected = actionIndexToRemoveFrom === i;
                            const isToRemove = typeof actionIndexToRemoveFrom === 'number' && actionIndexToRemoveFrom <= i;

                            return <tr key={i}>
                                <td
                                    style={isToRemove ? {
                                        // color: theme.text.contrast,
                                        textDecoration: 'line-through'
                                    } : undefined}
                                >
                                    {getActionDescription(action)}
                                </td>
                                <td>
                                    <Button
                                        onClick={() => selected
                                            ? setActionIndexToRemoveFrom(undefined)
                                            : setActionIndexToRemoveFrom(i)
                                        }
                                        selected={selected}
                                    >
                                        <Icon name='times' forButton />
                                    </Button>
                                </td>
                            </tr>;
                        })}
                    </tbody>
                </table>
            </div>

            {typeof actionIndexToRemoveFrom === 'number'
                && <Button
                    onClick={async () => {
                        await actionsDeleteMutation.mutateAsync({
                            params: {
                                actionIndexToRemoveFrom,
                            }
                        });
                        setActionIndexToRemoveFrom(undefined);
                    }}
                    bgColor={theme.bg.red}
                    style={{
                        alignSelf: 'flex-end'
                    }}
                >
                    <Icon name='times' forButton />
                    {t('storage.save-actions.actions.delete', { count: nbrSelectedActions })}
                </Button>}

            <Button
                big
                bgColor={theme.bg.primary}
                onClick={() => saveMutation.mutateAsync()}
                disabled={actions.length === 0 || typeof actionIndexToRemoveFrom === 'number'}
            >
                <Icon name='save' solid forButton />
                {t('action.save')}
            </Button>
        </div>
    </TitledContainer>;
});
