import React from 'react';
import { useStorageGetActions, useStorageSave } from '../../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../../error/with-error-catcher';
import type { UIActionProps } from '../../ui-new/actions-panel/ui-action';
import { UIActionsPanel } from '../../ui-new/actions-panel/ui-actions-panel';

/**
 * Display current session actions, and save button.
 */
export const ActionsPanel: React.FC = withErrorCatcher('default', () => {
    const actionsQuery = useStorageGetActions();
    const saveMutation = useStorageSave();

    const actions = actionsQuery.data?.data ?? [];

    return <UIActionsPanel
        data={actions.map((action): UIActionProps => {
            return {
                type: action.type,
            };
        })}
        onSave={() => saveMutation.mutateAsync()}
    />;
});
