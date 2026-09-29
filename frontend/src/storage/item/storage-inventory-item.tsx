import React from "react";
import { ItemImg, type ItemImgProps } from '../../img/item-img';
import { UIStorageInventoryItem, type UIStorageInventoryItemProps } from '../../ui/storage/storage-item/ui-storage-inventory-item';
import type { MoveContainerValue } from '../move/move-container-fns';
import { useCurrentStorage } from '../panel/storage-panel-context';
import { useStaticData } from '../../hooks/use-static-data';

export type StorageInventoryItemProps =
  & Pick<UIStorageInventoryItemProps<MoveContainerValue>, 'id' | 'nodeId' | 'name' | 'selected' | 'container' | 'count' | 'slot' | 'onClick' | 'selectFromPreviousSelected'>
  & Pick<ItemImgProps, 'item' | 'version'>;

export const StorageInventoryItem: React.FC<StorageInventoryItemProps> = React.memo(({
  item,
  version,
  name,

  ...rest
}) => {
  const { storageIndex } = useCurrentStorage();

  const staticData = useStaticData();
  const staticItem = staticData.getItem(version, item);

  return (
    <UIStorageInventoryItem
      globalOrder={storageIndex * 1000 + rest.slot}
      name={staticItem?.name ?? name}
      {...rest}
    >
      <ItemImg item={item} version={version} />
    </UIStorageInventoryItem>
  );
});
