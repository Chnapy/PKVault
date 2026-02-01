import React from 'react';
import { usePkmLegality, usePkmLegalityMap } from '../../data/hooks/use-pkm-legality';
import { usePkmVersionAttach } from '../../data/hooks/use-pkm-version-attach';
import { usePkmVersionIndex } from '../../data/hooks/use-pkm-version-index';
import { usePkmVersionSlotInfos } from '../../data/hooks/use-pkm-version-slot-infos';
import { PKMLoadError } from '../../data/sdk/model';
import { useStorageMainDeletePkmVersion } from '../../data/sdk/storage/storage.gen';
import { useSaveItemProps } from '../../saves/save-item/hooks/use-save-item-props';
import { useDesktopMessage } from '../../settings/save-globs/hooks/use-desktop-message';
import { useTranslate } from '../../translate/i18n';
import { DetailsTab } from '../../ui/details-card/details-tab';
import { SaveCardContentSmall } from '../../ui/save-card/save-card-content-small';
import { StorageDetailsBase } from '../../ui/storage-item-details/storage-details-base';
import { StorageDetailsForm } from '../../ui/storage-item-details/storage-details-form';
import { filterIsDefined } from '../../util/filter-is-defined';
import { switchUtilRequired } from '../../util/switch-util';
import { css } from '@emotion/css';

export type StorageDetailsMainProps = {
    selectedId: string;
};

export const StorageDetailsMain: React.FC<StorageDetailsMainProps> = ({ selectedId }) => {
    const [ selectedIndex, setSelectedIndex ] = React.useState(0);

    const versionInfos = usePkmVersionSlotInfos(selectedId);

    const pkmLegalityMapQuery = usePkmLegalityMap(versionInfos?.versions.map(pkm => pkm.id) ?? []);
    const pkmLegalityMap = pkmLegalityMapQuery.data?.data ?? {};

    if (!versionInfos) {
        return null;
    }

    const { versions } = versionInfos;

    const finalIndex = versions[ selectedIndex ] ? selectedIndex : 0;
    const pkmVersion = versions[ finalIndex ];

    return (
        <div className={css({ flexGrow: 1 })}>
            <div
                className={css({
                    display: 'flex',
                    gap: '0 4px',
                    padding: '0 8px',
                    flexWrap: 'wrap-reverse',
                })}
            >
                {versions.map((pkmVersion, i) => (
                    <DetailsTab
                        key={pkmVersion.id}
                        isEnabled={pkmVersion.isEnabled}
                        version={pkmVersion.isEnabled ? pkmVersion.version : null}
                        otName={`G${pkmVersion.generation}`}
                        original={pkmVersion.isMain}
                        onClick={() => setSelectedIndex(i)}
                        disabled={finalIndex === i}
                        warning={!pkmLegalityMap[ pkmVersion.id ]?.isValid}
                    />
                ))}
            </div>

            {pkmVersion && (
                <StorageDetailsForm.Provider key={pkmVersion.id} nickname={pkmVersion.nickname} eVs={pkmVersion.eVs} moves={pkmVersion.moves}>
                    <InnerStorageDetailsMain id={pkmVersion.id} />
                </StorageDetailsForm.Provider>
            )}
        </div>
    );
};

const InnerStorageDetailsMain: React.FC<{ id: string }> = ({ id }) => {
    const { t } = useTranslate();

    const formContext = StorageDetailsForm.useContext();

    const getSaveItemProps = useSaveItemProps();

    const mainPkmVersionDeleteMutation = useStorageMainDeletePkmVersion();

    const mainPkmVersionsQuery = usePkmVersionIndex();

    const pkmLegalityQuery = usePkmLegality(id);
    const pkmLegality = pkmLegalityQuery.data?.data;

    const getPkmVersionAttach = usePkmVersionAttach();

    const desktopMessage = useDesktopMessage();

    const pkmVersion = mainPkmVersionsQuery.data?.data.byId[ id ];
    const saveCardProps = pkmVersion?.attachedSaveId ? getSaveItemProps(pkmVersion.attachedSaveId) : undefined;

    const openFile =
        desktopMessage && pkmVersion?.isFilePresent
            ? () =>
                desktopMessage.openFile({
                    type: 'open-folder',
                    id: pkmVersion.id,
                    isDirectory: false,
                    path: pkmVersion.filepath,
                })
            : undefined;

    if (!pkmVersion) {
        return null;
    }

    return (
        <StorageDetailsBase
            {...pkmVersion}
            version={pkmVersion.isEnabled ? pkmVersion.version : null}
            isValid
            movesLegality={[]}
            {...pkmLegality}
            idBase={pkmVersion.id}
            validityReport={[
                filterIsDefined(pkmVersion.loadError) &&
                t('details.load-error', {
                    loadError: switchUtilRequired(pkmVersion.loadError, {
                        [ PKMLoadError.UNKNOWN ]: t('details.load-error.0'),
                        [ PKMLoadError.NOT_FOUND ]: t('details.load-error.1'),
                        [ PKMLoadError.TOO_SMALL ]: t('details.load-error.2'),
                        [ PKMLoadError.TOO_BIG ]: t('details.load-error.3'),
                        [ PKMLoadError.UNAUTHORIZED ]: t('details.load-error.4'),
                    }),
                    filepath: pkmVersion.filepath,
                }),
                !pkmVersion.isEnabled && t('details.is-disabled'),
                !getPkmVersionAttach(pkmVersion, pkmVersion.id).isAttachedValid && t('details.attached-pkm-not-found'),
                pkmLegality?.validityReport,
            ]
                .filter(Boolean)
                .join('\n---\n')}
            isShadow={false}
            onRelease={
                pkmVersion.canDelete
                    ? () =>
                        mainPkmVersionDeleteMutation.mutateAsync({
                            params: {
                                pkmVersionIds: [ pkmVersion.id ],
                            },
                        })
                    : undefined
            }
            onSubmit={() => formContext.submitForPkmVersion(id)}
            openFile={openFile}
            extraContent={saveCardProps && <SaveCardContentSmall {...saveCardProps} />}
        />
    );
};
