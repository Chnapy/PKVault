import React from 'react';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageMainDeletePkmVersion } from '../../data/sdk/storage/storage.gen';
import { useSaveItemProps } from '../../saves/save-item/hooks/use-save-item-props';
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
                    warning={!pkmVersion.isValid}
                />
            ))}
        </div>

        <StorageDetailsForm.Provider
            key={pkmVersion.id}
            nickname={pkmVersion.nickname}
            eVs={pkmVersion.eVs}
            moves={pkmVersion.moves}
        >
            <InnerStorageDetailsMain
                id={pkmVersion.id}
            />
        </StorageDetailsForm.Provider>
    </div>;
};

const InnerStorageDetailsMain: React.FC<{ id: string }> = ({ id }) => {
    const formContext = StorageDetailsForm.useContext();

    const getSaveItemProps = useSaveItemProps();

    const mainPkmVersionDeleteMutation = useStorageMainDeletePkmVersion();

    const mainPkmQuery = useStorageGetMainPkms();
    const mainPkmVersionsQuery = useStorageGetMainPkmVersions();

    const pkmVersion = mainPkmVersionsQuery.data?.data.find(version => version.id === id);
    const pkm = pkmVersion && mainPkmQuery.data?.data.find(value => value.id === pkmVersion.pkmId);
    const nbrRelatedPkmVersion = mainPkmVersionsQuery.data?.data.filter(version => version.pkmId === pkm?.id).length;
    const saveCardProps = pkm?.saveId ? getSaveItemProps(pkm.saveId) : undefined;

    if (!pkm || !pkmVersion) {
        return null;
    }

    return (
        <StorageDetailsBase
            {...pkmVersion}
            isValid={pkmVersion.isValid && pkmVersion.isAttachedValid}
            validityReport={[
                !pkmVersion.isAttachedValid && "Pkm not found in attached save."
                + "\nIf expected consider detach from save."
                + "\nOtherwise check the save integrity.",
                pkmVersion.validityReport ].filter(Boolean).join('\n---\n')
            }
            isShadow={false}
            onRelease={pkm?.canDelete && (pkmVersion.canDelete || nbrRelatedPkmVersion === 1)
                ? (() => mainPkmVersionDeleteMutation.mutateAsync({
                    pkmVersionId: pkmVersion.id,
                }))
                : undefined
            }
            onSubmit={() => formContext.submitForPkmVersion(id)}
            extraContent={saveCardProps && <SaveCardContentSmall {...saveCardProps} />}
        />
    );
};
