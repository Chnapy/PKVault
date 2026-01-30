import React from 'react';
import { useStorageDeleteActions, useStorageGetActions, useStorageSave } from '../../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../../error/with-error-catcher';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { TitledContainer } from '../../ui/container/titled-container';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { useActionDescription } from './hooks/use-action-description';
import { DataActionType } from '../../data/sdk/model';

export const ActionsPanel: React.FC = withErrorCatcher('default', () => {
    const { t } = useTranslate();
    const [ expanded, setExpanded ] = React.useState(false);

    const actionsQuery = useStorageGetActions();
    const actionsDeleteMutation = useStorageDeleteActions();
    const saveMutation = useStorageSave();

    const getActionDescription = useActionDescription();

    const [ actionIndexToRemoveFrom, setActionIndexToRemoveFrom ] = React.useState<number>();

    const actions = actionsQuery.data?.data ?? [];

    const shouldBeReduced = actions.length === 0;

    React.useEffect(() => {
        if (expanded && shouldBeReduced) {
            setExpanded(false);
        }
    }, [ shouldBeReduced, expanded ]);

    const nbrSelectedActions = actionIndexToRemoveFrom === undefined ? 0 : (actions.length - actionIndexToRemoveFrom);

    const expandIcon = actions.length > 0 && <Icon name={expanded ? 'angle-down' : 'angle-up'} forButton />;

    return <TitledContainer
        contrasted
        enableExpand={actions.length > 0}
        expanded={expanded}
        setExpanded={value => {
            setExpanded(value);
            if (!value)
                setActionIndexToRemoveFrom(undefined);
        }}
        title={<div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    padding: '0 4px',
                }}
            >
                {expandIcon}
                {t('storage.save-actions.title', { count: actions.length })}
                {expandIcon}
            </div>

            {!expanded && actions.length > 0 && <Button
                bgColor={theme.bg.primary}
                onClick={(e) => {
                    e.stopPropagation();
                    return saveMutation.mutateAsync();
                }}
                style={{
                    margin: -4,
                    marginLeft: 'auto',
                    minWidth: 80,
                }}
            >
                <Icon name='save' solid forButton />
                {t('action.save')}
            </Button>}
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

                            // these actions are data normalization on startup,
                            // remove them can break data
                            const cannotBeRemoved = ([
                                DataActionType.DATA_NORMALIZE,
                                DataActionType.PKM_SYNCHRONIZE
                            ] as number[]).includes(action.type);

                            return <tr key={i}>
                                <td
                                    style={{
                                        width: '100%',
                                        textDecoration: isToRemove ? 'line-through' : undefined,
                                    }}
                                >
                                    {getActionDescription(action)}
                                </td>
                                <td>
                                    {!cannotBeRemoved && <Button
                                        onClick={() => selected
                                            ? setActionIndexToRemoveFrom(undefined)
                                            : setActionIndexToRemoveFrom(i)
                                        }
                                        selected={selected}
                                    >
                                        <Icon name='times' forButton />
                                    </Button>}
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
