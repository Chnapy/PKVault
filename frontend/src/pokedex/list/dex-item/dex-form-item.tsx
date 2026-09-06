import React from "react";
import { Gender as GenderType } from "../../../data/sdk/model";
import { withErrorCatcher } from "../../../error/with-error-catcher";
import { useStaticData } from '../../../hooks/use-static-data';
import { SpeciesImg } from '../../../img/species-img';
import type { SpeciesFormItem } from "../../../pokedex/list/hooks/use-pokedex-items";
import { UIPokedexFormItem } from '../../../ui/pokedex/pokedex-item/ui-pokedex-form-item';

export const DexFormItem: React.FC<Omit<SpeciesFormItem, "id">> = withErrorCatcher("item", ({
  species,
  context,
  form,
  genders,
  isSeen,
  isSeenAlpha,
  isSeenShiny,
  isCaught,
  isOwned,
  isOwnedShiny,
}) => {
  const staticData = useStaticData();

  const isMega = !!staticData.species[ species ]?.forms[ context ]?.[ form ]?.isMega;

  return <UIPokedexFormItem
    genders={genders}
    isSeen={isSeen}
    isSeenAlpha={isSeenAlpha}
    isCaught={isCaught}
    isOwned={isOwned}
    isOwnedShiny={isOwnedShiny || isSeenShiny}
    isMega={isMega}
  >
    <SpeciesImg
      species={species}
      context={context}
      form={form}
      isFemale={genders[ 0 ] == GenderType.Female}
    />
  </UIPokedexFormItem>;
});
