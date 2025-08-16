import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useAbilityByIdOrName } from '../../data/hooks/use-ability-by-id-or-name';
import { useCurrentLanguageName } from '../../data/hooks/use-current-language-name';
import { useMoveByIdOrName } from '../../data/hooks/use-move-by-id-or-name';
import { useNatureByIdOrName } from '../../data/hooks/use-nature-by-id-or-name';
import { useTypeByIdOrName } from '../../data/hooks/use-type-by-id-or-name';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { getStorageGetActionsQueryKey, getStorageGetMainPkmsQueryKey, getStorageGetMainPkmVersionsQueryKey, getStorageGetSavePkmsQueryKey, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageMainCreatePkmVersion, useStorageMainDeletePkmVersion, useStorageMainPkmDetachSave, useStorageSaveSynchronizePkm } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../data/static-data/static-data';
import { getGender } from '../../data/utils/get-gender';
import { Route } from '../../routes/storage';
import { Button } from '../../ui/button/button';
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

    // const pkmSpeciesRecord = useStaticData().pokemonSpecies;
    const pkmRecord = useStaticData().pokemon;

    const getTypeByIdOrName = useTypeByIdOrName();
    const getMoveByIdOrName = useMoveByIdOrName();
    const getAbilityByIdOrName = useAbilityByIdOrName();
    const getNatureByIdOrName = useNatureByIdOrName();
    const getCurrentLanguageName = useCurrentLanguageName();

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

    const pkmSaveRaw = pkm.saveId ? saveInfosQuery.data?.data[ pkm.saveId ] : undefined;
    const pkmSave = pkmSaveRaw && pkmVersion.generation === pkmSaveRaw.generation ? pkmSaveRaw : undefined;

    const hasPkmForSaveGeneration = !!save && pkmVersionList.some(pkmVersion => pkmVersion.generation === save.generation);

    const gender = getGender(pkmVersion.gender);

    const originTrainerGender = getGender(pkmVersion.originTrainerGender);

    const types = pkmRecord[ pkm.species ].types.map(type =>
        getCurrentLanguageName(getTypeByIdOrName(type.type.name).names)
    );

    const moves = pkmVersion.moves.map(id => {
        const move = getMoveByIdOrName(id);

        return move ? getCurrentLanguageName(move.names) : '-';
    });

    const ability = typeof pkmVersion.ability === 'number' ? getAbilityByIdOrName(pkmVersion.ability) : undefined;
    const abilityStr = ability && getCurrentLanguageName(ability.names);

    const nature = typeof pkmVersion.nature === 'number' ? getNatureByIdOrName(pkmVersion.nature) : undefined;
    const natureStr = nature && getCurrentLanguageName(nature.names);

    const isCompatibleWithSave = !save || pkm.species <= save.maxSpeciesId;

    return <StorageMainDetails
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
        isShiny={pkmVersion.isShiny}
        isEgg={pkmVersion.isEgg}
        ball={pkmVersion.ball}
        gender={gender}
        nickname={pkmVersion.nickname}
        types={types}
        stats={pkmVersion.stats}
        ivs={pkmVersion.iVs}
        evs={pkmVersion.eVs}
        hiddenPowerType={getCurrentLanguageName(getTypeByIdOrName(pkmVersion.hiddenPowerType).names)}
        hiddenPowerPower={pkmVersion.hiddenPowerPower}
        nature={natureStr}
        ability={abilityStr}
        level={pkmVersion.level}
        exp={pkmVersion.exp}
        moves={moves}
        tid={pkmVersion.tid}
        originTrainerName={pkmVersion.originTrainerName}
        originTrainerGender={originTrainerGender}
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
        onSynchronize={saveId && pkmVersion ? (() => savePkmSynchronizeMutation.mutateAsync({
            saveId,
            params: {
                pkmVersionId: pkmVersion.id,
            }
        })) : undefined}
        onSaveCheck={attachedSavePkm ? (() => navigateToSave({
            to: '/saves'
        })) : undefined}
        onDetach={attachedSavePkm ? (() => mainPkmDetachSaveMutation.mutateAsync({
            params: {
                pkmId: pkm.id,
            }
        })) : undefined}
        onRelease={attachedSavePkm
            ? undefined
            : (() => mainPkmVersionDeleteMutation.mutateAsync({
                params: {
                    pkmVersionId: pkmVersion.id,
                }
            }))}
        onClose={() => navigate({
            search: {
                selected: undefined,
            }
        })}
    />;
};
