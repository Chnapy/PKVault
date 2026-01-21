import React from 'react';
import { usePkmLegality } from '../../data/hooks/use-pkm-legality';
import { usePkmSaveIndex } from '../../data/hooks/use-pkm-save-index';
import { useStorageSaveDeletePkms } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { StorageDetailsBase } from '../../ui/storage-item-details/storage-details-base';
import { StorageDetailsForm } from '../../ui/storage-item-details/storage-details-form';

export type StorageDetailsSaveProps = {
    selectedId: string;
    saveId: number;
};

export const StorageDetailsSave: React.FC<StorageDetailsSaveProps> = ({ selectedId, saveId }) => {
    const savePkmQuery = usePkmSaveIndex(saveId);

    const savePkm = savePkmQuery.data?.data.byId[ selectedId ];
    if (!savePkm) return null;

    return (
        <StorageDetailsForm.Provider key={savePkm.id} nickname={savePkm.nickname} eVs={savePkm.eVs} moves={savePkm.moves}>
            <InnerStorageDetailsSave
                id={savePkm.id}
                saveId={saveId}
            // goToMainPkm={pkm && (() => navigate({
            //     search: {
            //         selected: {
            //             type: 'main',
            //             id: pkm.id,
            //         },
            //     }
            // }))}
            />
        </StorageDetailsForm.Provider>
    );
};

const InnerStorageDetailsSave: React.FC<{ id: string; saveId: number }> = ({ id, saveId }) => {
    const { t } = useTranslate();
    const formContext = StorageDetailsForm.useContext();

    const savePkmDeleteMutation = useStorageSaveDeletePkms();

    const savePkmQuery = usePkmSaveIndex(saveId);
    // const pkmVersionsQuery = useStorageGetMainPkmVersions();

    const pkmLegalityQuery = usePkmLegality(id, saveId);
    const pkmLegality = pkmLegalityQuery.data?.data;

    const savePkm = savePkmQuery.data?.data.byId[ id ];
    if (!savePkm) return null;

    // const attachedPkmNotFound = savePkm.pkmVersionId
    //     ? !pkmVersionsQuery.data?.data.some(pkmVersion => pkmVersion.id === savePkm.pkmVersionId)
    //     : false;

    return (
        <StorageDetailsBase
            {...savePkm}
            isValid
            movesLegality={[]}
            {...pkmLegality}
            validityReport={[ savePkm.isDuplicate && t('details.is-duplicate'), pkmLegality?.validityReport ].filter(Boolean).join('\n---\n')}
            onRelease={
                savePkm.canDelete
                    ? () =>
                        savePkmDeleteMutation.mutateAsync({
                            saveId,
                            params: {
                                pkmIds: [ savePkm.id ],
                            },
                        })
                    : undefined
            }
            onSubmit={() => formContext.submitForPkmSave(saveId, id)}
        />
    );
};
