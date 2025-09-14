import React from 'react';
import { GameVersion } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageMainDeletePkmVersion } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { DetailsTab } from '../../ui/details-card/details-tab';
import { StorageDetailsForm } from '../../ui/storage-item-details/storage-details-form';
import { StorageMainDetails } from '../../ui/storage-item-details/storage-main-details';

export type StorageDetailsMainProps = {
    selectedId: string;
    saveId?: number;
};

export const StorageDetailsMain: React.FC<StorageDetailsMainProps> = ({
    selectedId,
    saveId,
}) => {
    const [ selectedIndex, setSelectedIndex ] = React.useState(0);

    const navigate = Route.useNavigate();

    const staticData = useStaticData();

    const mainPkmVersionDeleteMutation = useStorageMainDeletePkmVersion();

    const saveInfosQuery = useSaveInfosGetAll();
    const mainPkmQuery = useStorageGetMainPkms();
    const mainPkmVersionsQuery = useStorageGetMainPkmVersions();

    const pkm = mainPkmQuery.data?.data.find(value => value.id === selectedId);
    const pkmVersionList = mainPkmVersionsQuery.data?.data.filter(value => value.pkmId === selectedId) ?? [];

    const savePkmQuery = useStorageGetSavePkms(pkm?.saveId!, {
        query: {
            enabled: !!pkm?.saveId,
        },
    });

    const save = saveId ? saveInfosQuery.data?.data[ saveId ] : undefined;
    if (save) {
        pkmVersionList.sort((a) => a.generation === save.generation ? -1 : 0);
    }

    const pkmVersion = pkmVersionList[ selectedIndex ] ?? pkmVersionList[ 0 ];

    const attachedSavePkm = pkm?.saveId ? savePkmQuery.data?.data.find(savePkm => savePkm.pkmVersionId === pkmVersion.id) : undefined;
    const attachedSavePkmNotFound = !!pkm?.saveId && !attachedSavePkm;

    if (!pkm || pkmVersionList.length === 0) {
        return null;
    }

    // const species = pkmVersionList[ 0 ].species;

    const pkmSaveRaw = pkm.saveId ? saveInfosQuery.data?.data[ pkm.saveId ] : undefined;
    const pkmSave = pkmSaveRaw && pkmVersion.generation === pkmSaveRaw.generation ? pkmSaveRaw : undefined;

    // const isCompatibleWithSave = !save || species <= staticData.versions[ save.version ].maxSpeciesId;

    const sprite = pkmVersion.isShiny
        ? staticData.species[ pkmVersion.species ].spriteShiny
        : (pkmVersion.isEgg
            ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png'
            : staticData.species[ pkmVersion.species ].spriteDefault);

    const ballSprite = staticData.items[ pkmVersion.ball ].sprite;

    return <StorageDetailsForm.Provider
        key={pkmVersion.id}
        nickname={pkmVersion.nickname}
        eVs={pkmVersion.eVs}
        moves={pkmVersion.moves}
    >
        <StorageMainDetails
            header={
                <>
                    {/* {!isCompatibleWithSave && <Button
                        disabled
                        bgColor={theme.text.contrast}
                        style={{ width: '100%' }}
                    >
                        Not compatible with save G{save.generation}
                    </Button>}

                    {isCompatibleWithSave && pkm.saveId && save && pkm.saveId !== save.id && <Button
                        disabled
                        bgColor={theme.text.contrast}
                        style={{ width: '100%' }}
                    >
                        Already present in another save ({pkm.saveId})
                    </Button>} */}

                    {pkmVersionList.map((pkmVersion, i) => (
                        <DetailsTab
                            key={pkmVersion.id}
                            version={GameVersion[ `Gen${pkmVersion.generation as 1}` ]}
                            otName={`G${pkmVersion.generation}`}
                            original={pkmVersion.isMain}
                            onClick={() => setSelectedIndex(i)}
                            disabled={selectedIndex === i}
                        />
                    ))}
                </>
            }
            id={pkmVersion.id}
            saveId={pkmSave?.id}
            generation={pkmVersion.generation}
            version={pkmVersion.version}
            pid={pkmVersion.pid}
            species={pkmVersion.species}
            speciesName={pkmVersion.speciesName}
            isShiny={pkmVersion.isShiny}
            sprite={sprite}
            ballSprite={ballSprite}
            gender={pkmVersion.gender}
            nickname={pkmVersion.nickname}
            nicknameMaxLength={pkmVersion.nicknameMaxLength}
            types={pkmVersion.types}
            stats={pkmVersion.stats}
            ivs={pkmVersion.iVs}
            evs={pkmVersion.eVs}
            hiddenPowerType={pkmVersion.hiddenPowerType}
            hiddenPowerPower={pkmVersion.hiddenPowerPower}
            hiddenPowerCategory={pkmVersion.hiddenPowerCategory}
            nature={pkmVersion.nature}
            ability={pkmVersion.ability}
            level={pkmVersion.level}
            exp={pkmVersion.exp}
            moves={pkmVersion.moves}
            availableMoves={pkmVersion.availableMoves.map(move => move.id)}
            tid={pkmVersion.tid}
            originTrainerName={pkmVersion.originTrainerName}
            originTrainerGender={pkmVersion.originTrainerGender}
            originMetDate={pkmVersion.originMetDate}
            originMetLocation={pkmVersion.originMetLocation}
            originMetLevel={pkmVersion.originMetLevel}
            heldItem={pkmVersion.heldItem}
            isValid={pkmVersion.isValid}
            validityReport={pkmVersion.validityReport}
            box={pkm.boxId}
            boxSlot={pkm.boxSlot}
            saveBoxId={attachedSavePkm?.box}
            saveBoxSlot={attachedSavePkm?.boxSlot}
            saveSynchronized={attachedSavePkm?.dynamicChecksum === pkmVersion.dynamicChecksum}
            attachedSavePkmNotFound={attachedSavePkmNotFound}
            onRelease={pkm?.saveId
                ? undefined
                : (() => mainPkmVersionDeleteMutation.mutateAsync({
                    pkmVersionId: pkmVersion.id,
                }))}
            onClose={() => navigate({
                search: {
                    selected: undefined,
                }
            })}
        />
    </StorageDetailsForm.Provider>;
};
