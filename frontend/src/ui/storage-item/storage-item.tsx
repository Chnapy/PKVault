import React from "react";
import type { MoveContainerValue } from '../../storage/move/move-container-fns';
import { useCurrentStorage } from '../../storage/panel/storage-panel-context';
import { UIStorageItem, type UIStorageItemProps } from '../../ui-new/storage/storage-item/ui-storage-item';
import { SpeciesImg, type SpeciesImgProps } from '../img/species-img';

export type StorageItemProps =
  & Pick<UIStorageItemProps<MoveContainerValue>, 'id' | 'nodeId' | 'selected' | 'container' | 'name' | 'level' | 'slot' | 'onClick' | 'icons'>
  & Pick<SpeciesImgProps, 'species' | 'context' | 'form' | 'isFemale' | 'isShiny' | 'isEgg' | 'isShadow'>;

export const StorageItem: React.FC<StorageItemProps> = React.memo(({
  species,
  context,
  form,
  isFemale,
  isEgg,
  isShiny,
  isShadow,

  ...rest
}) => {
  const { storageIndex } = useCurrentStorage();

  return (
    <UIStorageItem
      globalOrder={storageIndex * 1000 + rest.slot}
      {...rest}
    >
      <SpeciesImg species={species} context={context} form={form} isFemale={isFemale} isShiny={isShiny} isEgg={isEgg} isShadow={isShadow} />
    </UIStorageItem>
  );
});
