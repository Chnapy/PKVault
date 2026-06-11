import React from "react";
import { withErrorCatcher } from '../../error/with-error-catcher';
import { type MoveContainerValue } from '../../storage/move/move-container-fns';
import { UIStorageItemPlaceholder, type UIStorageItemPlaceholderProps } from '../../ui-new/storage/storage-item/placeholder/ui-storage-item-placeholder';

export type StorageItemPlaceholderProps = Pick<UIStorageItemPlaceholderProps, 'nodeId' | 'slot'>
  & {
    saveId: number | null;
    boxId: string;
  };

export const StorageItemPlaceholder: React.FC<StorageItemPlaceholderProps> = withErrorCatcher('item', ({
  saveId, boxId, ...rest
}) => {
  const container = React.useMemo((): MoveContainerValue => saveId
    ? {
      type: 'save-item',
      saveId,
      boxId,
    }
    : {
      type: 'main-item',
      boxId,
    }, [ boxId, saveId ]);

  return <UIStorageItemPlaceholder
    key={rest.nodeId}
    container={container}
    {...rest}
  />;
});
