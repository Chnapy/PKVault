import React from 'react';
import { useStorageDeleteActions, useStorageGetActions, useStorageSave } from '../../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../../error/with-error-catcher';
import type { UIActionProps } from '../../ui-new/actions-panel/ui-action';
import { UIActionsPanel } from '../../ui-new/actions-panel/ui-actions-panel';

/**
 * Display current session actions, and save button.
 */
export const ActionsPanel: React.FC = withErrorCatcher('default', () => {
    const actionsQuery = useStorageGetActions();
    const deleteActionsMutation = useStorageDeleteActions();
    const saveMutation = useStorageSave();

    const actions = actionsQuery.data?.data ?? [];

    return <UIActionsPanel
        data={actions.map((action): UIActionProps => {
            return {
                type: action.type,
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
