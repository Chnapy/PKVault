import React from 'react';
import { usePkmLegality, usePkmLegalityMap } from '../../data/hooks/use-pkm-legality';
import { usePkmVersionAttach } from '../../data/hooks/use-pkm-version-attach';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageMainDeletePkmVersion } from '../../data/sdk/storage/storage.gen';
import { useSaveItemProps } from '../../saves/save-item/hooks/use-save-item-props';
import { useDesktopMessage } from '../../settings/save-globs/hooks/use-desktop-message';
import { useTranslate } from '../../translate/i18n';
import { DetailsTab } from '../../ui/details-card/details-tab';
import { SaveCardContentSmall } from '../../ui/save-card/save-card-content-small';
import { StorageDetailsBase } from '../../ui/storage-item-details/storage-details-base';
import { StorageDetailsForm } from '../../ui/storage-item-details/storage-details-form';

export type StorageDetailsMainProps = {
    selectedId: string;
};

export const StorageDetailsMain: React.FC<StorageDetailsMainProps> = ({
    selectedId,
}) => {
    const [ selectedIndex, setSelectedIndex ] = React.useState(0);

    const mainPkmVersionsQuery = useStorageGetMainPkmVersions();

    const pkmVersionList = mainPkmVersionsQuery.data?.data.filter(value => value.pkmId === selectedId) ?? [];
    const pkmLegalityMapQuery = usePkmLegalityMap(pkmVersionList.map(pkm => pkm.id));
    const pkmLegalityMap = pkmLegalityMapQuery.data?.data ?? {};
    if (pkmVersionList.length === 0) {
        return null;
    }

    const finalIndex = pkmVersionList[ selectedIndex ] ? selectedIndex : 0;
    const pkmVersion = pkmVersionList[ finalIndex ];

    return <div>
        <div
            style={{
                display: 'flex',
                gap: '0 4px',
                padding: '0 8px',
                flexWrap: 'wrap-reverse',
            }}
        >
            {pkmVersionList.map((pkmVersion, i) => (
                <DetailsTab
                    key={pkmVersion.id}
                    version={pkmVersion.version}
                    otName={`G${pkmVersion.generation}`}
                    original={pkmVersion.isMain}
                    onClick={() => setSelectedIndex(i)}
                    disabled={finalIndex === i}
                    warning={!pkmLegalityMap[ pkmVersion.id ]?.isValid}
                />
            ))}
        </div>

        {pkmVersion && <StorageDetailsForm.Provider
            key={pkmVersion.id}
            nickname={pkmVersion.nickname}
            eVs={pkmVersion.eVs}
            moves={pkmVersion.moves}
        >
            <InnerStorageDetailsMain
                id={pkmVersion.id}
            />
        </StorageDetailsForm.Provider>}
    </div>;
};

const InnerStorageDetailsMain: React.FC<{ id: string }> = ({ id }) => {
    const { t } = useTranslate();

    const formContext = StorageDetailsForm.useContext();

    const getSaveItemProps = useSaveItemProps();

    const mainPkmVersionDeleteMutation = useStorageMainDeletePkmVersion();

    const mainPkmQuery = useStorageGetMainPkms();
    const mainPkmVersionsQuery = useStorageGetMainPkmVersions();

    const pkmLegalityQuery = usePkmLegality(id);
    const pkmLegality = pkmLegalityQuery.data?.data;

    const getPkmVersionAttach = usePkmVersionAttach();

    const desktopMessage = useDesktopMessage();

    const pkmVersion = mainPkmVersionsQuery.data?.data.find(version => version.id === id);
    const pkm = pkmVersion && mainPkmQuery.data?.data.find(value => value.id === pkmVersion.pkmId);
    const nbrRelatedPkmVersion = mainPkmVersionsQuery.data?.data.filter(version => version.pkmId === pkm?.id).length;
    const saveCardProps = pkm?.saveId ? getSaveItemProps(pkm.saveId) : undefined;

    const openFile = desktopMessage && pkmVersion?.isFilePresent
        ? (() => desktopMessage.openFile({
            type: 'open-folder',
            id: pkmVersion.id,
            isDirectory: false,
            path: pkmVersion.filepath
        }))
        : undefined;

    if (!pkm || !pkmVersion) {
        return null;
    }

    return (
        <StorageDetailsBase
            {...pkmVersion}
            isValid
            movesLegality={[]}
            {...pkmLegality}
            idBase={pkmVersion.id}
            validityReport={[
                !getPkmVersionAttach(pkm, pkmVersion.id).isAttachedValid && t('details.attached-pkm-not-found'),
                pkmLegality?.validityReport ].filter(Boolean).join('\n---\n')
            }
            isShadow={false}
            onRelease={pkm?.canDelete && (pkmVersion.canDelete || nbrRelatedPkmVersion === 1)
                ? (() => mainPkmVersionDeleteMutation.mutateAsync({
                    params: {
                        pkmVersionIds: [ pkmVersion.id ]
                    },
                }))
                : undefined
            }
            onSubmit={() => formContext.submitForPkmVersion(id)}
            openFile={openFile}
            extraContent={saveCardProps && <SaveCardContentSmall {...saveCardProps} />}
        />
    );
};
