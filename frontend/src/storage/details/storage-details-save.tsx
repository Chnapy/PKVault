import React from 'react';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageSaveDeletePkm } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { StorageDetailsForm } from '../../ui/storage-item-details/storage-details-form';
import { StorageSaveDetails } from '../../ui/storage-item-details/storage-save-details';

export type StorageDetailsSaveProps = {
    selectedId: string;
    saveId: number;
};

export const StorageDetailsSave: React.FC<StorageDetailsSaveProps> = ({
    selectedId,
    saveId,
}) => {
    const navigate = Route.useNavigate();

    const staticData = useStaticData();

    const savePkmDeleteMutation = useStorageSaveDeletePkm();

    const savePkmQuery = useStorageGetSavePkms(saveId);
    const pkmsQuery = useStorageGetMainPkms();
    const pkmVersionsQuery = useStorageGetMainPkmVersions();

    const savePkm = savePkmQuery.data?.data.find((pkm) => pkm.id === selectedId);
    if (!savePkm)
        return null;

    const pkmVersion = savePkm.pkmVersionId ? pkmVersionsQuery.data?.data.find(pkmVersion => pkmVersion.id === savePkm.pkmVersionId) : undefined;
    const pkm = pkmVersion ? pkmsQuery.data?.data.find(pkm => pkm.id === pkmVersion.pkmId) : undefined;

    const sprite = savePkm.isShiny
        ? staticData.species[ savePkm.species ].spriteShiny
        : (savePkm.isEgg
            ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png'
            : staticData.species[ savePkm.species ].spriteDefault);

    const ballSprite = staticData.items[ savePkm.ball ].sprite;

    return <StorageDetailsForm.Provider
        key={savePkm.id}
        nickname={savePkm.nickname}
        eVs={savePkm.eVs}
        moves={savePkm.moves}
    >
        <StorageSaveDetails
            id={savePkm.id}
            saveId={saveId}
            generation={savePkm.generation}
            version={savePkm.version}
            pid={savePkm.pid}
            species={savePkm.species}
            speciesName={savePkm.speciesName}
            isShiny={savePkm.isShiny}
            isEgg={savePkm.isEgg}
            isShadow={savePkm.isShadow}
            sprite={sprite}
            ballSprite={ballSprite}
            gender={savePkm.gender}
            nickname={savePkm.nickname}
            nicknameMaxLength={savePkm.nicknameMaxLength}
            types={savePkm.types}
            stats={savePkm.stats}
            ivs={savePkm.iVs}
            evs={savePkm.eVs}
            hiddenPowerType={savePkm.hiddenPowerType}
            hiddenPowerPower={savePkm.hiddenPowerPower}
            hiddenPowerCategory={savePkm.hiddenPowerCategory}
            nature={savePkm.nature}
            ability={savePkm.ability}
            level={savePkm.level}
            exp={savePkm.exp}
            moves={savePkm.moves}
            availableMoves={savePkm.availableMoves.map(move => move.id)}
            tid={savePkm.tid}
            originTrainerName={savePkm.originTrainerName}
            originTrainerGender={savePkm.originTrainerGender}
            originMetDate={savePkm.originMetDate}
            originMetLocation={savePkm.originMetLocation}
            originMetLevel={savePkm.originMetLevel}
            heldItem={savePkm.heldItem}
            isValid={savePkm.isValid}
            validityReport={savePkm.validityReport}
            box={savePkm.box}
            boxSlot={savePkm.boxSlot}
            mainBoxId={pkm?.boxId}
            mainBoxSlot={pkm?.boxSlot}
            saveSynchronized={savePkm.dynamicChecksum === pkmVersion?.dynamicChecksum}
            goToMainPkm={pkm && (() => navigate({
                search: {
                    selected: {
                        type: 'main',
                        id: pkm.id,
                    },
                }
            }))}
            canMoveToMainStorage={savePkm.canMoveToMainStorage}
            onRelease={pkm
                ? undefined
                : (() => savePkmDeleteMutation.mutateAsync({
                    saveId,
                    pkmId: savePkm.id,
                }))}
            onClose={() => navigate({
                search: {
                    selected: undefined,
                }
            })}
        />
    </StorageDetailsForm.Provider>;
};
