import React from "react";
import { useAbilityByIdOrName } from '../data/hooks/use-ability-by-id-or-name';
import { useCurrentLanguageName } from '../data/hooks/use-current-language-name';
import { useMoveByIdOrName } from '../data/hooks/use-move-by-id-or-name';
import { useNatureByIdOrName } from '../data/hooks/use-nature-by-id-or-name';
import { useTypeByIdOrName } from '../data/hooks/use-type-by-id-or-name';
import {
  useStorageGetSavePkms
} from "../data/sdk/storage/storage.gen";
import { useStaticData } from "../data/static-data/static-data";
import { getGender } from '../data/utils/get-gender';
import { Route } from '../routes/storage';
import { StorageSaveDetails } from '../ui/storage-item-details/storage-save-details';
import { StorageDetailsMain } from './details/storage-details-main';

export type StorageDetailsProps = {
  type: "main" | "save";
  id: string;
  saveId?: number;
};

export const StorageDetails: React.FC<StorageDetailsProps> = ({
  type,
  id,
  saveId,
}) => {
  const navigate = Route.useNavigate();

  // const pkmSpeciesRecord = useStaticData().pokemonSpecies;
  const pkmRecord = useStaticData().pokemon;

  const getTypeByIdOrName = useTypeByIdOrName();
  const getMoveByIdOrName = useMoveByIdOrName();
  const getAbilityByIdOrName = useAbilityByIdOrName();
  const getNatureByIdOrName = useNatureByIdOrName();
  const getCurrentLanguageName = useCurrentLanguageName();

  // const saveInfosRecord = useSaveInfosGetAll().data?.data ?? {};
  // const saveInfos = saveInfosRecord[ saveId ?? -1 ]?.[ 0 ] as
  //   | SaveInfosDTO
  //   | undefined;

  const savePkmQuery = useStorageGetSavePkms(saveId!, {
    query: {
      enabled: !!saveId && type === "save",
    },
  });

  // let mainPkm = mainPkmQuery.data?.data.find((pkm) => pkm.id === id);
  // let mainPkmVersions =
  //   mainPkmVersionsQuery.data?.data.filter(
  //     (pkm) => pkm.id === id || pkm.pkmId === id
  //   ) ?? [];

  // if (mainPkmVersions.length && !mainPkm) {
  //   mainPkm = mainPkmQuery.data?.data.find(
  //     (pkm) => pkm.id === mainPkmVersions[ 0 ].pkmId
  //   );
  //   mainPkmVersions =
  //     mainPkmVersionsQuery.data?.data.filter(
  //       (pkm) => pkm.id === id || pkm.pkmId === mainPkm!.id
  //     ) ?? [];
  // }

  // const pkmList = [ ...mainPkmVersions ].filter(Boolean);

  // const selectedPkm = pkmList[ selectedIndex ] ?? pkmList[ 0 ];
  // if (!selectedPkm) {
  //   return null;
  // }

  // const species =
  //   "species" in selectedPkm ? selectedPkm.species : mainPkm!.species;

  // const speciesName = getCurrentLanguageName(pkmSpeciesRecord[ species ].names);

  if (type === 'main') {
    return <StorageDetailsMain
      selectedId={id}
      saveId={saveId}
    />;
  }

  if (type === 'save') {
    const savePkm = savePkmQuery.data?.data.find((pkm) => pkm.id === id);
    if (!savePkm)
      return null;

    const gender = getGender(savePkm.gender);

    const originTrainerGender = getGender(savePkm.originTrainerGender);

    const types = pkmRecord[ savePkm.species ].types.map(type =>
      getCurrentLanguageName(getTypeByIdOrName(type.type.name).names)
    );

    const moves = savePkm.moves.map(id => {
      const move = getMoveByIdOrName(id);

      return move ? getCurrentLanguageName(move.names) : '-';
    });

    const ability = typeof savePkm.ability === 'number' ? getAbilityByIdOrName(savePkm.ability) : undefined;
    const abilityStr = ability && getCurrentLanguageName(ability.names);

    const nature = typeof savePkm.nature === 'number' ? getNatureByIdOrName(savePkm.nature) : undefined;
    const natureStr = nature && getCurrentLanguageName(nature.names);

    return <StorageSaveDetails
      id={savePkm.id}
      generation={savePkm.generation}
      version={savePkm.version}
      pid={savePkm.pid}
      species={savePkm.species}
      isShiny={savePkm.isShiny}
      isEgg={savePkm.isEgg}
      isShadow={savePkm.isShadow}
      ball={savePkm.ball}
      gender={gender}
      nickname={savePkm.nickname}
      types={types}
      stats={savePkm.stats}
      ivs={savePkm.iVs}
      evs={savePkm.eVs}
      hiddenPowerType={getCurrentLanguageName(getTypeByIdOrName(savePkm.hiddenPowerType).names)}
      hiddenPowerPower={savePkm.hiddenPowerPower}
      nature={natureStr}
      ability={abilityStr}
      level={savePkm.level}
      exp={savePkm.exp}
      moves={moves}
      tid={savePkm.tid}
      originTrainerName={savePkm.originTrainerName}
      originTrainerGender={originTrainerGender}
      originMetDate={savePkm.originMetDate}
      originMetLocation={savePkm.originMetLocation}
      originMetLevel={savePkm.originMetLevel}
      isValid={savePkm.isValid}
      validityReport={savePkm.validityReport}
      box={savePkm.box}
      boxSlot={savePkm.boxSlot}
      canMoveToMainStorage={savePkm.canMoveToMainStorage}
      onRelease={console.log}
      onClose={() => navigate({
        search: {
          selected: undefined,
        }
      })}
    />;
  }

  // return (
  //   <StorageItemDetails
  //     header={
  //       <>
  //         <div>id={id}</div>
  //         {!!mainPkm &&
  //           pkmList.map((pkm, i) =>
  //             pkmList.filter((p) => p.id === pkm.id).length > 1 ? null : (
  //               <Button
  //                 key={pkm.id}
  //                 onClick={() => setSelectedIndex(i)}
  //                 disabled={selectedIndex === i}
  //               >
  //                 G{pkm.generation}
  //                 {pkm.id === mainPkm?.id && " (original)"}
  //                 {/* {pkm.id} */}
  //               </Button>
  //             )
  //           )}

  //         {saveInfos &&
  //           !pkmList.some((pkm) => pkm.generation === saveInfos.generation) && (
  //             <Button
  //               onClick={() =>
  //                 mainCreatePkmVersionMutation.mutateAsync({
  //                   params: {
  //                     generation: saveInfos.generation,
  //                     pkmId: mainPkm!.id,
  //                   },
  //                 })
  //               }
  //             >
  //               Create for G{saveInfos.generation}
  //             </Button>
  //           )}
  //       </>
  //     }
  //     saveId={undefined}
  //     species={species}
  //     speciesName={speciesName}
  //     version={undefined}
  //     generation={selectedPkm.generation}
  //     isEgg={selectedPkm.isEgg}
  //     originStr={`${selectedPkm.originMetDate} ${selectedPkm.originMetLocation} originTrainerName=${selectedPkm.originTrainerName}`}
  //     // nickname={selectedPkm.nickname}
  //     stats={selectedPkm.stats}
  //     ivs={selectedPkm.iVs}
  //     evs={selectedPkm.eVs}
  //     nature={selectedPkm.nature}
  //     ability={selectedPkm.ability}
  //     level={selectedPkm.level}
  //     exp={selectedPkm.exp}
  //     moves={selectedPkm.moves}
  //     isValid={selectedPkm.isValid}
  //     validityReport={selectedPkm.validityReport}
  //   />
  // );
};
