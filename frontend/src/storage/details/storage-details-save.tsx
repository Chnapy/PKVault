import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { getStorageGetActionsQueryKey, getStorageGetMainPkmVersionsQueryKey, getStorageGetSavePkmsQueryKey, useStorageEvolvePkm, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageSaveDeletePkm, useStorageSaveSynchronizePkm } from '../../data/sdk/storage/storage.gen';
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

    const evolvePkmMutation = useStorageEvolvePkm({
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
            speciesName={savePkm.speciesName}
            isShiny={savePkm.isShiny}
            isEgg={savePkm.isEgg}
            isShadow={savePkm.isShadow}
            sprite={savePkm.sprite}
            ballSprite={savePkm.ballSprite}
            gender={savePkm.gender}
            nickname={savePkm.nickname}
            nicknameMaxLength={savePkm.nicknameMaxLength}
            types={savePkm.types}
            stats={savePkm.stats}
            ivs={savePkm.iVs}
            evs={savePkm.eVs}
            hiddenPowerType={savePkm.hiddenPowerType}
            hiddenPowerPower={savePkm.hiddenPowerPower}
            nature={savePkm.nature}
            ability={savePkm.ability}
            level={savePkm.level}
            exp={savePkm.exp}
            moves={savePkm.moves}
            availableMoves={savePkm.availableMoves}
            tid={savePkm.tid}
            originTrainerName={savePkm.originTrainerName}
            originTrainerGender={savePkm.originTrainerGender}
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
            onEvolve={savePkm.canEvolve && !pkmVersion
                ? (() => evolvePkmMutation.mutateAsync({
                    id: savePkm.id,
                    params: {
                        saveId,
                    },
                }))
                : undefined
            }
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
