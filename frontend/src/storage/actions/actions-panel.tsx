import React from 'react';
import { useStorageDeleteActions, useStorageGetActions, useStorageSave } from '../../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../../error/with-error-catcher';
import { UIActionsPanel } from '../../ui-new/actions-panel/ui-actions-panel';
import { useActionDescription } from './hooks/use-action-description';

/**
 * Display current session actions, and save button.
 */
export const ActionsPanel: React.FC = withErrorCatcher('default', () => {
    const actionsQuery = useStorageGetActions();
    const deleteActionsMutation = useStorageDeleteActions();
    const saveMutation = useStorageSave();

    const getActionDescription = useActionDescription();

    const actions = actionsQuery.data?.data ?? [];

    return <UIActionsPanel
        data={actions.map((action) => {
            return {
                type: action.type,
                description: getActionDescription(action),
            };
        })}
        onDelete={(index: number) => deleteActionsMutation.mutateAsync({
            params: {
                actionIndexToRemoveFrom: index,
            },
        })}
        onSave={() => saveMutation.mutateAsync()}
    />;
});
