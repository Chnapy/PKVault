import React from "react";
import { useDroppableValidation } from '../../storage/move/hooks/use-droppable-validation';
import type { MoveContainerValue } from '../../storage/move/move-container-fns';
import { UIStorageItem, type UIStorageItemProps } from '../../ui-new/storage/storage-item/ui-storage-item';
import { SpeciesImg, type SpeciesImgProps } from '../img/species-img';

export type StorageItemProps =
  & Pick<UIStorageItemProps<MoveContainerValue>, 'id' | 'nodeId' | 'container' | 'name' | 'level' | 'slot' | 'onClick' | 'icons'>
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
  const validation = useDroppableValidation(rest.slot, rest.container);

  return (
    <UIStorageItem
      {...rest}
      label={validation.helpText}
      disabled={validation.canDrop === false}
    >
      <SpeciesImg species={species} context={context} form={form} isFemale={isFemale} isShiny={isShiny} isEgg={isEgg} isShadow={isShadow} />
    </UIStorageItem>
  );
});
