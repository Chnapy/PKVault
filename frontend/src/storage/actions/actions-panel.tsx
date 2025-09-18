import React from 'react';
import { DataActionType } from '../../data/sdk/model';
import { useStorageDeleteActions, useStorageGetActions, useStorageSave } from '../../data/sdk/storage/storage.gen';
import { Button } from '../../ui/button/button';
import { TitledContainer } from '../../ui/container/titled-container';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { switchUtil } from '../../util/switch-util';

export const ActionsPanel: React.FC = () => {
    const actionsQuery = useStorageGetActions();
    const actionsDeleteMutation = useStorageDeleteActions();
    const saveMutation = useStorageSave();

    const [ actionIndexToRemoveFrom, setActionIndexToRemoveFrom ] = React.useState<number>();

    const actions = actionsQuery.data?.data ?? [];

    const nbrSelectedActions = actionIndexToRemoveFrom === undefined ? 0 : (actions.length - actionIndexToRemoveFrom);

    return <TitledContainer
        contrasted
        enableExpand
        maxHeight={400}
        title={<div
            style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
            }}
        >
            <Icon name='angle-down' forButton />
            {actions.length} actions to save
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
                                {switchUtil(action.type, {
                                    [ DataActionType.MAIN_CREATE_PKM_VERSION ]: 'Create pkm-version',
                                    [ DataActionType.MOVE_PKM ]: 'Move pkm',
                                    [ DataActionType.DETACH_PKM_SAVE ]: 'Detach save from pkm',
                                    [ DataActionType.EDIT_PKM_VERSION ]: 'Edit pkm-version',
                                    [ DataActionType.EDIT_PKM_SAVE ]: 'Edit pkm-save',
                                    [ DataActionType.DELETE_PKM_VERSION ]: 'Delete pkm-version',
                                    [ DataActionType.SAVE_DELETE_PKM ]: 'Delete save pkm',
                                    [ DataActionType.PKM_SYNCHRONIZE ]: 'Synchronize pkm',
                                    [ DataActionType.EVOLVE_PKM ]: 'Evolve pkm',
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
                                    <Icon name='times' forButton />
                                </Button>
                            </td>
                        </tr>;
                    })}
                </tbody>
            </table>

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
                    Delete {nbrSelectedActions} selected actions
                </Button>}

            <Button
                big
                bgColor={theme.bg.primary}
                onClick={() => saveMutation.mutateAsync()}
                disabled={actions.length === 0 || typeof actionIndexToRemoveFrom === 'number'}
            >
                <Icon name='save' solid forButton />
                Save
            </Button>
        </div>
    </TitledContainer>;
};
