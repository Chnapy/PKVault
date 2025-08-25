import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { getStorageGetActionsQueryKey, getStorageGetMainPkmsQueryKey, getStorageGetMainPkmVersionsQueryKey, getStorageGetSavePkmsQueryKey, useStorageEvolvePkm, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageMainCreatePkmVersion, useStorageMainDeletePkmVersion, useStorageMainPkmDetachSave, useStorageSaveSynchronizePkm } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { Button } from '../../ui/button/button';
import { StorageDetailsForm } from '../../ui/storage-item-details/storage-details-form';
import { StorageMainDetails } from '../../ui/storage-item-details/storage-main-details';
import { theme } from '../../ui/theme';

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
    const navigateToSave = Route.useNavigate();

    const queryClient = useQueryClient();

    const mainCreatePkmVersionMutation = useStorageMainCreatePkmVersion({
        mutation: {
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: getStorageGetActionsQueryKey(),
                });

                await queryClient.invalidateQueries({
                    queryKey: getStorageGetMainPkmsQueryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: getStorageGetMainPkmVersionsQueryKey(),
                });

                if (saveId) {
                    await queryClient.invalidateQueries({
                        queryKey: getStorageGetSavePkmsQueryKey(saveId),
                    });
                }
            },
        },
    });

    const savePkmSynchronizeMutation = useStorageSaveSynchronizePkm({
        mutation: {
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: getStorageGetActionsQueryKey(),
                });

                await queryClient.invalidateQueries({
                    queryKey: getStorageGetMainPkmVersionsQueryKey(),
                });

                if (saveId) {
                    await queryClient.invalidateQueries({
                        queryKey: getStorageGetSavePkmsQueryKey(saveId),
                    });
                }
            },
        },
    });

    const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave({
        mutation: {
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: getStorageGetActionsQueryKey(),
                });

                await queryClient.invalidateQueries({
                    queryKey: getStorageGetMainPkmsQueryKey(),
                });

                await queryClient.invalidateQueries({
                    queryKey: getStorageGetMainPkmVersionsQueryKey(),
                });

                if (saveId) {
                    await queryClient.invalidateQueries({
                        queryKey: getStorageGetSavePkmsQueryKey(saveId),
                    });
                }
            },
        },
    });

    const mainPkmVersionDeleteMutation = useStorageMainDeletePkmVersion({
        mutation: {
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: getStorageGetActionsQueryKey(),
                });

                await queryClient.invalidateQueries({
                    queryKey: getStorageGetMainPkmsQueryKey(),
                });

                await queryClient.invalidateQueries({
                    queryKey: getStorageGetMainPkmVersionsQueryKey(),
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
                    queryKey: getStorageGetMainPkmsQueryKey(),
                });

                await queryClient.invalidateQueries({
                    queryKey: getStorageGetMainPkmVersionsQueryKey(),
                });
            },
        },
    });

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

    const species = pkmVersionList[ 0 ].species;

    const pkmSaveRaw = pkm.saveId ? saveInfosQuery.data?.data[ pkm.saveId ] : undefined;
    const pkmSave = pkmSaveRaw && pkmVersion.generation === pkmSaveRaw.generation ? pkmSaveRaw : undefined;

    const hasPkmForSaveGeneration = !!save && pkmVersionList.some(pkmVersion => pkmVersion.generation === save.generation);

    const isCompatibleWithSave = !save || species <= save.maxSpeciesId;

    return <StorageDetailsForm.Provider
        key={pkmVersion.id}
        nickname={pkmVersion.nickname}
        eVs={pkmVersion.eVs}
        moves={pkmVersion.moves.map(move => move.id)}
    >
        <StorageMainDetails
            header={
                <>
                    {!isCompatibleWithSave && <Button
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
                    </Button>}

                    {!pkm.saveId && save && isCompatibleWithSave && !hasPkmForSaveGeneration && <Button
                        onClick={() =>
                            mainCreatePkmVersionMutation.mutateAsync({
                                params: {
                                    generation: save.generation,
                                    pkmId: pkm.id,
                                },
                            })
                        }
                        style={{ width: '100%' }}
                    >
                        Create version for G{save.generation}
                    </Button>}

                    {pkmVersionList.map((pkmVersion, i) => (
                        <Button
                            key={pkmVersion.id}
                            onClick={() => setSelectedIndex(i)}
                            disabled={selectedIndex === i}
                            style={{ width: save?.generation === pkmVersion.generation ? '100%' : undefined }}
                        >
                            G{pkmVersion.generation}
                            {pkmVersion.id === pkm.id && " (original)"}
                        </Button>
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
            isEgg={pkmVersion.isEgg}
            sprite={pkmVersion.sprite}
            ballSprite={pkmVersion.ballSprite}
            gender={pkmVersion.gender}
            nickname={pkmVersion.nickname}
            nicknameMaxLength={pkmVersion.nicknameMaxLength}
            types={pkmVersion.types}
            stats={pkmVersion.stats}
            ivs={pkmVersion.iVs}
            evs={pkmVersion.eVs}
            hiddenPowerType={pkmVersion.hiddenPowerType}
            hiddenPowerPower={pkmVersion.hiddenPowerPower}
            nature={pkmVersion.nature}
            ability={pkmVersion.ability}
            level={pkmVersion.level}
            exp={pkmVersion.exp}
            moves={pkmVersion.moves}
            availableMoves={pkmVersion.availableMoves}
            tid={pkmVersion.tid}
            originTrainerName={pkmVersion.originTrainerName}
            originTrainerGender={pkmVersion.originTrainerGender}
            originMetDate={pkmVersion.originMetDate}
            originMetLocation={pkmVersion.originMetLocation}
            originMetLevel={pkmVersion.originMetLevel}
            heldItemSprite={pkmVersion.spriteItem}
            heldItemText={pkmVersion.heldItemText}
            isValid={pkmVersion.isValid}
            validityReport={pkmVersion.validityReport}
            box={pkm.boxId}
            boxSlot={pkm.boxSlot}
            saveBoxId={attachedSavePkm?.box}
            saveBoxSlot={attachedSavePkm?.boxSlot}
            saveSynchronized={attachedSavePkm?.dynamicChecksum === pkmVersion.dynamicChecksum}
            goToSavePkm={attachedSavePkm && (() => navigate({
                search: {
                    save: attachedSavePkm.saveId,
                    saveBoxId: attachedSavePkm.box.toString(),
                    selected: {
                        type: 'save',
                        id: attachedSavePkm.id,
                    },
                }
            }))}
            attachedSavePkmNotFound={attachedSavePkmNotFound}
            onEvolve={pkmVersion.canEvolve && !attachedSavePkm
                ? (() => evolvePkmMutation.mutateAsync({
                    id: pkmVersion.id,
                    params: {},
                }))
                : undefined
            }
            onSynchronize={saveId ? (() => savePkmSynchronizeMutation.mutateAsync({
                saveId,
                params: {
                    pkmVersionId: pkmVersion.id,
                }
            })) : undefined}
            onSaveCheck={attachedSavePkm ? (() => navigateToSave({
                to: '/saves'
            })) : undefined}
            onDetach={attachedSavePkm ? (() => mainPkmDetachSaveMutation.mutateAsync({
                pkmId: pkm.id,
            })) : undefined}
            onRelease={attachedSavePkm
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
