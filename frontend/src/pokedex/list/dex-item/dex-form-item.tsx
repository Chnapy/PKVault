import React from "react";
import { Gender as GenderType } from "../../../data/sdk/model";
import { withErrorCatcher } from "../../../error/with-error-catcher";
import type { SpeciesFormItem } from "../../../pokedex/list/hooks/use-pokedex-items";
import { UIPokedexFormItem } from '../../../ui/pokedex/pokedex-item/ui-pokedex-form-item';
import { SpeciesImg } from '../../../img/species-img';

export const DexFormItem: React.FC<Omit<SpeciesFormItem, "id">> = withErrorCatcher("item", ({
  species,
  context,
  form,
  genders,
  isSeen,
  isSeenAlpha,
  isCaught,
  isOwned,
  isOwnedShiny,
}) => {

  return <UIPokedexFormItem
    genders={genders}
    isSeen={isSeen}
    isSeenAlpha={isSeenAlpha}
    isCaught={isCaught}
    isOwned={isOwned}
    isOwnedShiny={isOwnedShiny}
  >
    <SpeciesImg
      species={species}
      context={context}
      form={form}
      isFemale={genders[ 0 ] == GenderType.Female}
    />
  </UIPokedexFormItem>;
});
