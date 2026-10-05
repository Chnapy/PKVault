import React from "react";
import { withErrorCatcher } from '../../error/with-error-catcher';
import { UIStorageInventoryItemPlaceholder, type UIStorageInventoryItemPlaceholderProps } from '../../ui/storage/storage-item/placeholder/ui-storage-inventory-item-placeholder';
import { type MoveContainerValue } from '../move/move-container-fns';
import { useCurrentStorage } from '../panel/storage-panel-context';

export type StorageInventoryItemPlaceholderProps = Pick<UIStorageInventoryItemPlaceholderProps, 'nodeId' | 'slot' | 'loading'>
  & {
    saveId: number | null;
    boxId: string;
  };

export const StorageInventoryItemPlaceholder: React.FC<StorageInventoryItemPlaceholderProps> = withErrorCatcher('item', ({
  saveId, boxId, ...rest
}) => {
  const { storageIndex } = useCurrentStorage();

  const container = React.useMemo((): MoveContainerValue => saveId
    ? {
      type: 'inventory-item',
      saveId,
      boxId,
    }
    : {
      type: 'inventory-item',
      boxId,
    }, [ boxId, saveId ]);

  return <UIStorageInventoryItemPlaceholder
    key={rest.nodeId}
    container={container}
    globalOrder={storageIndex * 1000 + rest.slot}
    {...rest}
  />;
});
