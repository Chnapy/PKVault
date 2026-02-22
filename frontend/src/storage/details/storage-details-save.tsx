import { css } from '@emotion/css';
import React from 'react';
import { usePkmLegality } from '../../data/hooks/use-pkm-legality';
import { usePkmSaveIndex } from '../../data/hooks/use-pkm-save-index';
import { useStorageSaveDeletePkms } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { Icon } from '../../ui/icon/icon';
import { StorageDetailsBase } from '../../ui/storage-item-details/storage-details-base';
import { StorageDetailsForm } from '../../ui/storage-item-details/storage-details-form';
import { TextContainer } from '../../ui/text-container/text-container';
import { theme } from '../../ui/theme';

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
            />
        </StorageDetailsForm.Provider>
    );
};

const InnerStorageDetailsSave: React.FC<{ id: string; saveId: number }> = ({ id, saveId }) => {
    const { t } = useTranslate();
    const formContext = StorageDetailsForm.useContext();

    const savePkmDeleteMutation = useStorageSaveDeletePkms();

    const savePkmQuery = usePkmSaveIndex(saveId);

    const pkmLegalityQuery = usePkmLegality(id, saveId);
    const pkmLegality = pkmLegalityQuery.data?.data;

    const savePkm = savePkmQuery.data?.data.byId[ id ];
    if (!savePkm) return null;

    return (
        <StorageDetailsBase
            {...savePkm}
            isValid
            movesLegality={[]}
            {...pkmLegality}
            reports={<>
                {savePkm.isDuplicate && <TextContainer
                    bgColor={theme.bg.yellow}
                    maxHeight={200}
                    className={css({
                        minHeight: '1lh',
                        flexShrink: 0.1,
                    })}
                >
                    {t('details.is-duplicate')}
                </TextContainer>}

                {pkmLegality && !pkmLegality.isValid && pkmLegality.validityReport && <TextContainer
                    bgColor={theme.bg.yellow}
                    maxHeight={200}
                    className={css({
                        minHeight: '1lh',
                        flexShrink: 0.1,
                    })}
                >
                    <Icon name='exclamation-triangle' forButton />{' '}
                    {t('details.legality.1')}
                    <br />
                    <br />
                    {pkmLegality.validityReport}
                    <br />
                    <br />
                    {t('details.legality.2')}
                </TextContainer>}
            </>}
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
