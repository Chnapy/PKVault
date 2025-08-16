import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { getStorageGetActionsQueryKey, getStorageGetMainPkmsQueryKey, getStorageGetMainPkmVersionsQueryKey, getStorageGetSavePkmsQueryKey, useStorageDeleteActions, useStorageGetActions, useStorageSave } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { Button } from '../../ui/button/button';
import { Container } from '../../ui/container/container';
import { theme } from '../../ui/theme';
import { switchUtil } from '../../util/switch-util';
import { DataActionType } from '../../data/sdk/model';
import { getWarningsGetWarningsQueryKey } from '../../data/sdk/warnings/warnings.gen';

export const ActionsPanel: React.FC = () => {
    const saveId = Route.useSearch({ select: (search) => search.save });

    const queryClient = useQueryClient();

    const actionsQuery = useStorageGetActions();

    const [ showPanel, setShowPanel ] = React.useState<boolean>(false);
    const [ actionIndexToRemoveFrom, setActionIndexToRemoveFrom ] = React.useState<number>();

    const queriesInvalidate = async () => {
        await queryClient.invalidateQueries({
            queryKey: getStorageGetActionsQueryKey(),
        });
        await queryClient.invalidateQueries({
            queryKey: getStorageGetMainPkmsQueryKey(),
        });
        await queryClient.invalidateQueries({
            queryKey: getStorageGetMainPkmVersionsQueryKey(),
        });
        if (saveId) {
            await queryClient.invalidateQueries({
                queryKey: getStorageGetSavePkmsQueryKey(saveId),
            });
        }

        setActionIndexToRemoveFrom(undefined);
    };

    const saveMutation = useStorageSave({
        mutation: {
            onSuccess: async () => {
                await queriesInvalidate();

                await queryClient.invalidateQueries({
                    queryKey: getWarningsGetWarningsQueryKey(),
                });
            },
        },
    });

    const actionsDeleteMutation = useStorageDeleteActions({
        mutation: {
            onSuccess: queriesInvalidate,
        },
    });

    const actions = actionsQuery.data?.data ?? [];

    return <div
        style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: 2,
            paddingRight: 2,
        }}
    >
        <Button
            onClick={() => setShowPanel(!showPanel)}
            style={{
                borderBottomWidth: 0,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
            }}
        >
            Actions history & save
        </Button>

        {showPanel && <Container style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: 8,
        }}>
            <table
                style={{
                    width: '100%'
                }}
            >
                <tbody>
                    {actions.length === 0 && <tr>
                        <td>
                            (no actions)
                        </td>
                    </tr>}

                    {actions.map((action, i) => {
                        const selected = actionIndexToRemoveFrom === i;
                        const isToRemove = typeof actionIndexToRemoveFrom === 'number' && actionIndexToRemoveFrom <= i;

                        return <tr key={i}>
                            <td
                                style={isToRemove ? {
                                    color: theme.text.contrast,
                                    textDecoration: 'line-through'
                                } : undefined}
                            >
                                {switchUtil(action.type, {
                                    [ DataActionType.MAIN_CREATE_PKM_VERSION ]: 'Create pkm-version',
                                    [ DataActionType.MAIN_MOVE_PKM ]: 'Move pkm in main',
                                    [ DataActionType.SAVE_MOVE_PKM ]: 'Move pkm in save',
                                    [ DataActionType.SAVE_MOVE_PKM_FROM_STORAGE ]: 'Move pkm from storage to save',
                                    [ DataActionType.SAVE_MOVE_PKM_TO_STORAGE ]: 'Move pkm from save to storage',
                                    [ DataActionType.DETACH_PKM_SAVE ]: 'Detach save from pkm',
                                    [ DataActionType.DELETE_PKM_VERSION ]: 'Delete pkm-version',
                                    [ DataActionType.SAVE_DELETE_PKM ]: 'Delete save pkm',
                                    [ DataActionType.PKM_SYNCHRONIZE ]: 'Synchronize pkm',
                                })} - {action.parameters.join(', ')}
                            </td>
                            <td>
                                <Button
                                    onClick={() => selected
                                        ? setActionIndexToRemoveFrom(undefined)
                                        : setActionIndexToRemoveFrom(i)
                                    }
                                    selected={selected}
                                >
                                    X
                                </Button>
                            </td>
                        </tr>;
                    })}
                </tbody>
            </table>

            {typeof actionIndexToRemoveFrom === 'number'
                ? <Button
                    onClick={() => actionsDeleteMutation.mutateAsync({
                        params: {
                            actionIndexToRemoveFrom,
                        }
                    })}
                >
                    Remove actions from [{actionIndexToRemoveFrom}]
                </Button>
                : <Button onClick={() => saveMutation.mutateAsync()}>
                    Apply all actions & save
                </Button>}

        </Container>}
    </div>;
};
