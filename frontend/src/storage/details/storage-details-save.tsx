import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useAbilityByIdOrName } from '../../data/hooks/use-ability-by-id-or-name';
import { useCurrentLanguageName } from '../../data/hooks/use-current-language-name';
import { useMoveByIdOrName } from '../../data/hooks/use-move-by-id-or-name';
import { useNatureByIdOrName } from '../../data/hooks/use-nature-by-id-or-name';
import { useTypeByIdOrName } from '../../data/hooks/use-type-by-id-or-name';
import { getStorageGetActionsQueryKey, getStorageGetMainPkmVersionsQueryKey, getStorageGetSavePkmsQueryKey, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageSaveDeletePkm, useStorageSaveSynchronizePkm } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../data/static-data/static-data';
import { getGender } from '../../data/utils/get-gender';
import { Route } from '../../routes/storage';
import { StorageSaveDetails } from '../../ui/storage-item-details/storage-save-details';
import { StorageDetailsForm } from '../../ui/storage-item-details/storage-details-form';

export type StorageDetailsSaveProps = {
    selectedId: string;
    saveId: number;
};

export const StorageDetailsSave: React.FC<StorageDetailsSaveProps> = ({
    selectedId,
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

    const queryClient = useQueryClient();

    const savePkmSynchronizeMutation = useStorageSaveSynchronizePkm({
        mutation: {
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: getStorageGetActionsQueryKey(),
                });

                await queryClient.invalidateQueries({
                    queryKey: getStorageGetMainPkmVersionsQueryKey(),
                });

                await queryClient.invalidateQueries({
                    queryKey: getStorageGetSavePkmsQueryKey(saveId),
                });
            },
        },
    });

    const savePkmDeleteMutation = useStorageSaveDeletePkm({
        mutation: {
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: getStorageGetActionsQueryKey(),
                });

                await queryClient.invalidateQueries({
                    queryKey: getStorageGetSavePkmsQueryKey(saveId),
                });
            },
        },
    });

    const savePkmQuery = useStorageGetSavePkms(saveId);
    const pkmsQuery = useStorageGetMainPkms();
    const pkmVersionsQuery = useStorageGetMainPkmVersions();

    const savePkm = savePkmQuery.data?.data.find((pkm) => pkm.id === selectedId);
    if (!savePkm)
        return null;

    const pkmVersion = savePkm.pkmVersionId ? pkmVersionsQuery.data?.data.find(pkmVersion => pkmVersion.id === savePkm.pkmVersionId) : undefined;
    const pkm = pkmVersion ? pkmsQuery.data?.data.find(pkm => pkm.id === pkmVersion.pkmId) : undefined;

    const gender = getGender(savePkm.gender);

    const originTrainerGender = getGender(savePkm.originTrainerGender);

    const types = pkmRecord[ savePkm.species ].types.map(type =>
        getCurrentLanguageName(getTypeByIdOrName(type.type.name).names)
    );

    const ability = typeof savePkm.ability === 'number' ? getAbilityByIdOrName(savePkm.ability) : undefined;
    const abilityStr = ability && getCurrentLanguageName(ability.names);

    const nature = typeof savePkm.nature === 'number' ? getNatureByIdOrName(savePkm.nature) : undefined;
    const natureStr = nature && getCurrentLanguageName(nature.names);

    return <StorageDetailsForm.Provider
        key={savePkm.id}
        nickname={savePkm.nickname}
        eVs={savePkm.eVs}
        moves={savePkm.moves.map(move => move.id)}
    >
        <StorageSaveDetails
            id={savePkm.id}
            saveId={saveId}
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
            nicknameMaxLength={savePkm.nicknameMaxLength}
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
            moves={savePkm.moves}
            availableMoves={savePkm.availableMoves}
            tid={savePkm.tid}
            originTrainerName={savePkm.originTrainerName}
            originTrainerGender={originTrainerGender}
            originMetDate={savePkm.originMetDate}
            originMetLocation={savePkm.originMetLocation}
            originMetLevel={savePkm.originMetLevel}
            heldItemSprite={savePkm.spriteItem}
            heldItemText={savePkm.heldItemText}
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
            onSynchronize={pkmVersion ? (() => savePkmSynchronizeMutation.mutateAsync({
                saveId,
                params: {
                    pkmVersionId: pkmVersion.id,
                }
            })) : undefined}
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
