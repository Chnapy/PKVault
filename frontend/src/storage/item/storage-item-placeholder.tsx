import React from "react";
import { withErrorCatcher } from '../../error/with-error-catcher';
import { type MoveContainerValue } from '../move/move-container-fns';
import { useCurrentStorage } from '../panel/storage-panel-context';
import { UIStorageItemPlaceholder, type UIStorageItemPlaceholderProps } from '../../ui/storage/storage-item/placeholder/ui-storage-item-placeholder';

export type StorageItemPlaceholderProps = Pick<UIStorageItemPlaceholderProps, 'nodeId' | 'slot' | 'loading'>
  & {
    saveId: number | null;
    boxId: string;
  };

export const StorageItemPlaceholder: React.FC<StorageItemPlaceholderProps> = withErrorCatcher('item', ({
  saveId, boxId, ...rest
}) => {
  const { storageIndex } = useCurrentStorage();

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
    globalOrder={storageIndex * 1000 + rest.slot}
    {...rest}
  />;
});
