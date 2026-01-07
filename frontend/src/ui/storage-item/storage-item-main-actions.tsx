import type React from 'react';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageEvolvePkms, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageMainCreatePkmVersion, useStorageMainDeletePkmVersion, useStorageMainPkmDetachSave } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { getSaveOrder } from '../../storage/util/get-save-order';
import { useTranslate } from '../../translate/i18n';
import { filterIsDefined } from '../../util/filter-is-defined';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { ButtonWithDisabledPopover } from '../button/button-with-disabled-popover';
import { Icon } from '../icon/icon';
import { StorageDetailsForm } from '../storage-item-details/storage-details-form';
import { theme } from '../theme';
import { StorageItemMainActionsContainer } from './storage-item-main-actions-container';
import { usePkmSaveVersion } from '../../data/hooks/use-pkm-save-version';

export const StorageItemMainActions: React.FC = () => {
    const { t } = useTranslate();

    const navigate = Route.useNavigate();
    const saves = Route.useSearch({ select: (search) => search.saves }) ?? {};
    const selected = Route.useSearch({ select: (search) => search.selected });

    const formEditMode = StorageDetailsForm.useEditMode();

    const moveClickable = StorageMoveContext.useClickable(selected?.id ? [ selected.id ] : [], undefined);

    const staticData = useStaticData();

    const saveInfosQuery = useSaveInfosGetAll();
    const mainPkmQuery = useStorageGetMainPkms();
    const mainPkmVersionQuery = useStorageGetMainPkmVersions();

    const mainCreatePkmVersionMutation = useStorageMainCreatePkmVersion();
    const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();
    const evolvePkmsMutation = useStorageEvolvePkms();
    const mainPkmVersionDeleteMutation = useStorageMainDeletePkmVersion();

    const getPkmSaveVersion = usePkmSaveVersion();

    const selectedPkm = mainPkmQuery.data?.data.find(pkm => pkm.id === selected?.id);
    const pkmSavePkmQuery = useStorageGetSavePkms(selectedPkm?.saveId ?? 0);
    if (!selectedPkm) {
        return null;
    }

    const pkmVersions = mainPkmVersionQuery.data?.data.filter(version => version.pkmId === selectedPkm.id) ?? [];
    if (!pkmVersions[ 0 ]) {
        return null;
    }

    const { compatibleWithVersions } = pkmVersions[ 0 ];

    const pageSaves = Object.values(saves).map(save => save && saveInfosQuery.data?.data?.[ save.saveId ]).filter(filterIsDefined);

    const pkmVersionCanEvolve = pkmVersions.find(pkmVersion => {
        const staticEvolves = staticData.evolves[ pkmVersion.species ];
        const evolveSpecies = staticEvolves?.trade[ pkmVersion.version ] ?? staticEvolves?.tradeWithItem[ pkmVersion.heldItemPokeapiName ?? '' ]?.[ pkmVersion.version ];
        return !!evolveSpecies && pkmVersion.level >= evolveSpecies.minLevel;
    });

    const canCreateVersions = selectedPkm.saveId
        ? []
        : [ ... new Set(pageSaves
            .filter(pageSave => {
                const hasPkmForPageSaveGeneration = pkmVersions.some(pkmVersion => pkmVersion.generation === pageSave.generation);
                const isCompatibleWithPageSave = compatibleWithVersions.includes(pageSave.version);

                return isCompatibleWithPageSave && !hasPkmForPageSaveGeneration;
            })
            .map(pageSave => pageSave.generation)) ].sort();

    const canEvolve = pkmVersionCanEvolve;
    const canDetach = !!selectedPkm.saveId;
    const canGoToSave = !!selectedPkm.saveId;
    const canEdit = pkmVersions[ 0 ].canEdit;

    const canRemovePkm = selectedPkm.canDelete
        && mainPkmVersionQuery.data?.data.filter(pkmVersion => pkmVersion.pkmId === selectedPkm.id).length === 1;

    return <StorageItemMainActionsContainer pkmId={selectedPkm.id}>
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxWidth: 170,
            }}
        >
            {moveClickable.onClick && <Button
                onClick={moveClickable.onClick}
            >
                <Icon name='logout' solid forButton />
                {t('storage.actions.move')}
            </Button>}

            {moveClickable.onClickAttached && pageSaves.length > 0 && <ButtonWithDisabledPopover
                as={Button}
                onClick={moveClickable.onClickAttached}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.move-attached-main.helpTitle')}
                helpContent={t('storage.actions.move-attached-main.helpContent')}
            >
                <Icon name='link' solid forButton />
                <Icon name='logout' solid forButton />
                {t('storage.actions.move-attached-main')}
            </ButtonWithDisabledPopover>}

            {canCreateVersions.map(generation => <ButtonWithDisabledPopover
                key={generation}
                as={Button}
                bgColor={theme.bg.primary}
                onClick={() => mainCreatePkmVersionMutation.mutateAsync({
                    params: {
                        generation: generation,
                        pkmId: selectedPkm.id,
                    },
                })}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.create-version.helpTitle', { generation: generation })}
                helpContent={t('storage.actions.create-version.helpContent')}
            >
                <Icon name='plus' solid forButton />
                {t('storage.actions.create-version', { generation: generation })}
            </ButtonWithDisabledPopover>)}

            {canGoToSave && <ButtonWithDisabledPopover
                as={Button}
                onClick={() => {
                    const pkmVersionsIds = new Set(pkmVersions.map(version => version.id));

                    const attachedSavePkm = selectedPkm.saveId
                        ? pkmSavePkmQuery.data?.data.find(savePkm => {
                            const version = getPkmSaveVersion(savePkm.idBase, savePkm.saveId);
                            return version && pkmVersionsIds.has(version.id);
                        })
                        : undefined;

                    navigate({
                        search: ({ saves }) => ({
                            selected: attachedSavePkm && {
                                saveId: selectedPkm.saveId,
                                id: attachedSavePkm.id,
                            },
                            saves: selectedPkm.saveId ? {
                                ...saves,
                                [ selectedPkm.saveId ]: {
                                    saveId: selectedPkm.saveId,
                                    saveBoxIds: [ attachedSavePkm?.boxId ?? 0 ],
                                    order: getSaveOrder(saves, selectedPkm.saveId),
                                }
                            } : saves,
                        })
                    });
                }}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.go-main.helpTitle')}
            >
                <Icon name='link' solid forButton />
                {t('storage.actions.go-main')}
            </ButtonWithDisabledPopover>}

            {canEdit && <Button
                onClick={formEditMode.startEdit}
                disabled={formEditMode.editMode}
            >
                <Icon name='pen' solid forButton />
                {t('storage.actions.edit')}
            </Button>}

            {canEvolve && <ButtonWithConfirm
                anchor='right'
                bgColor={theme.bg.primary}
                onClick={async () => {
                    const mutateResult = await evolvePkmsMutation.mutateAsync({
                        params: {
                            ids: [ pkmVersionCanEvolve.id ]
                        },
                    });
                    const newId = mutateResult.data.mainPkms
                        ?.find(pkm => pkm.boxId === selectedPkm.boxId && pkm.boxSlot === selectedPkm.boxSlot)?.id;
                    if (newId) {
                        navigate({
                            search: {
                                selected: {
                                    id: newId,
                                    saveId: undefined,
                                }
                            }
                        });
                    }
                }}
            >
                <Icon name='sparkles' solid forButton />
                {t('storage.actions.evolve')}
            </ButtonWithConfirm>}

            {canDetach && <ButtonWithDisabledPopover
                as={ButtonWithConfirm}
                onClick={() => mainPkmDetachSaveMutation.mutateAsync({
                    params: {
                        pkmIds: [ selectedPkm.id ]
                    }
                })}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.detach-main.helpTitle')}
                helpContent={t('storage.actions.detach-main.helpContent')}
            >
                <Icon name='link' solid forButton />
                {t('storage.actions.detach-main')}
            </ButtonWithDisabledPopover>}

            {canRemovePkm && <ButtonWithConfirm
                anchor='right'
                bgColor={theme.bg.red}
                onClick={() => mainPkmVersionDeleteMutation.mutateAsync({
                    params: {
                        pkmVersionIds: [ selectedPkm.id ],
                    },
                })}
            >
                <Icon name='trash' solid forButton />
                {t('storage.actions.release')}
            </ButtonWithConfirm>}
        </div>
    </StorageItemMainActionsContainer>;
};
