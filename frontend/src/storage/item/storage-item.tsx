import React from "react";
import type { MoveContainerValue } from '../move/move-container-fns';
import { useCurrentStorage } from '../panel/storage-panel-context';
import { UIStorageItem, type UIStorageItemProps } from '../../ui/storage/storage-item/ui-storage-item';
import { SpeciesImg, type SpeciesImgProps } from '../../img/species-img';

export type StorageItemProps =
  & Pick<UIStorageItemProps<MoveContainerValue>, 'id' | 'nodeId' | 'selected' | 'container' | 'name' | 'level' | 'slot' | 'onClick' | 'selectFromPreviousSelected' | 'icons'>
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
