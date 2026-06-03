import React from "react";
import { withErrorCatcher } from '../../error/with-error-catcher';
import { useDroppableValidation } from '../../storage/move/hooks/use-droppable-validation';
import type { MoveContainerValue } from '../../storage/move/state/move-select-impl-provider';
import { UIStorageItemPlaceholderWithInteraction, type UIStorageItemPlaceholderWithInteractionProps } from '../../ui-new/storage/storage-item/placeholder/ui-storage-item-placeholder-with-interaction';

export type StorageItemPlaceholderProps = Pick<UIStorageItemPlaceholderWithInteractionProps, 'nodeId' | 'slot'>
  & MoveContainerValue;

export const StorageItemPlaceholder: React.FC<StorageItemPlaceholderProps> = withErrorCatcher('item', ({
  type, bankId, saveId, boxId,
  ...rest
}) => {
  const container = React.useMemo((): MoveContainerValue => ({
    type,
    bankId,
    saveId,
    boxId,
  }), [ bankId, boxId, saveId, type ]);

  const validation = useDroppableValidation(rest.slot, container);

  return <UIStorageItemPlaceholderWithInteraction
    key={rest.nodeId}
    container={container}
    label={validation.helpText}
    disabled={!validation.canDrop}
    {...rest}
  />;
});
