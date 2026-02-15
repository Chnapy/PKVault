import React from 'react';
import { usePkmLegality, usePkmLegalityMap } from '../../data/hooks/use-pkm-legality';
import { usePkmVariantAttach } from '../../data/hooks/use-pkm-variant-attach';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import { usePkmVariantSlotInfos } from '../../data/hooks/use-pkm-variant-slot-infos';
import { PKMLoadError } from '../../data/sdk/model';
import { useStorageMainDeletePkmVariant } from '../../data/sdk/storage/storage.gen';
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

    const variantInfos = usePkmVariantSlotInfos(selectedId);

    const pkmLegalityMapQuery = usePkmLegalityMap(variantInfos?.variants.map(pkm => pkm.id) ?? []);
    const pkmLegalityMap = pkmLegalityMapQuery.data?.data ?? {};

    if (!variantInfos) {
        return null;
    }

    const { variants } = variantInfos;

    const finalIndex = variants[ selectedIndex ] ? selectedIndex : 0;
    const pkmVariant = variants[ finalIndex ];

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
                {variants.map((pkmVariant, i) => (
                    <DetailsTab
                        key={pkmVariant.id}
                        isEnabled={pkmVariant.isEnabled}
                        version={pkmVariant.isEnabled ? pkmVariant.version : null}
                        otName={`G${pkmVariant.generation}`}
                        original={pkmVariant.isMain}
                        onClick={() => setSelectedIndex(i)}
                        disabled={finalIndex === i}
                        warning={!pkmLegalityMap[ pkmVariant.id ]?.isValid}
                    />
                ))}
            </div>

            {pkmVariant && (
                <StorageDetailsForm.Provider key={pkmVariant.id} nickname={pkmVariant.nickname} eVs={pkmVariant.eVs} moves={pkmVariant.moves}>
                    <InnerStorageDetailsMain id={pkmVariant.id} />
                </StorageDetailsForm.Provider>
            )}
        </div>
    );
};

const InnerStorageDetailsMain: React.FC<{ id: string }> = ({ id }) => {
    const { t } = useTranslate();

    const formContext = StorageDetailsForm.useContext();

    const getSaveItemProps = useSaveItemProps();

    const mainPkmVariantDeleteMutation = useStorageMainDeletePkmVariant();

    const mainPkmVariantsQuery = usePkmVariantIndex();

    const pkmLegalityQuery = usePkmLegality(id);
    const pkmLegality = pkmLegalityQuery.data?.data;

    const getPkmVariantAttach = usePkmVariantAttach();

    const desktopMessage = useDesktopMessage();

    const pkmVariant = mainPkmVariantsQuery.data?.data.byId[ id ];
    const saveCardProps = pkmVariant?.attachedSaveId ? getSaveItemProps(pkmVariant.attachedSaveId) : undefined;

    const openFile =
        desktopMessage && pkmVariant?.isFilePresent
            ? () =>
                desktopMessage.openFile({
                    type: 'open-folder',
                    isDirectory: false,
                    path: pkmVariant.filepath,
                })
            : undefined;

    if (!pkmVariant) {
        return null;
    }

    return (
        <StorageDetailsBase
            {...pkmVariant}
            version={pkmVariant.isEnabled ? pkmVariant.version : null}
            isValid
            movesLegality={[]}
            {...pkmLegality}
            idBase={pkmVariant.id}
            validityReport={[
                filterIsDefined(pkmVariant.loadError) &&
                t('details.load-error', {
                    loadError: switchUtilRequired(pkmVariant.loadError, {
                        [ PKMLoadError.UNKNOWN ]: t('details.load-error.0'),
                        [ PKMLoadError.NOT_LOADED ]: t('details.load-error.0'),
                        [ PKMLoadError.NOT_FOUND ]: t('details.load-error.1'),
                        [ PKMLoadError.TOO_SMALL ]: t('details.load-error.2'),
                        [ PKMLoadError.TOO_BIG ]: t('details.load-error.3'),
                        [ PKMLoadError.UNAUTHORIZED ]: t('details.load-error.4'),
                    }),
                    filepath: pkmVariant.filepath,
                }),
                !pkmVariant.isEnabled && t('details.is-disabled'),
                !getPkmVariantAttach(pkmVariant, pkmVariant.id).isAttachedValid && t('details.attached-pkm-not-found'),
                pkmLegality?.validityReport,
            ]
                .filter(Boolean)
                .join('\n---\n')}
            isShadow={false}
            onRelease={
                pkmVariant.canDelete
                    ? () =>
                        mainPkmVariantDeleteMutation.mutateAsync({
                            params: {
                                pkmVariantIds: [ pkmVariant.id ],
                            },
                        })
                    : undefined
            }
            onSubmit={() => formContext.submitForPkmVariant(id)}
            openFile={openFile}
            extraContent={saveCardProps && <SaveCardContentSmall {...saveCardProps} />}
        />
    );
};
