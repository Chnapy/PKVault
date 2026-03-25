import { css } from '@emotion/css';
import React from 'react';
import { usePkmLegality, usePkmLegalityMap } from '../../data/hooks/use-pkm-legality';
import { usePkmVariantAttach } from '../../data/hooks/use-pkm-variant-attach';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import { usePkmVariantSlotInfos } from '../../data/hooks/use-pkm-variant-slot-infos';
import { EntityContext, PKMLoadError } from '../../data/sdk/model';
import { useStorageMainDeletePkmVariant } from '../../data/sdk/storage/storage.gen';
import { getEntityContextGenerationName } from '../../data/util/get-entity-context-generation-name';
import { Route } from '../../routes/storage';
import { useSaveItemProps } from '../../saves/save-item/hooks/use-save-item-props';
import { useDesktopMessage } from '../../settings/globs-input/hooks/use-desktop-message';
import { PathLine } from '../../settings/path-line';
import { useTranslate } from '../../translate/i18n';
import type { DetailsExpandedState } from '../../ui/details-card/details-card-container';
import { DetailsTab } from '../../ui/details-card/details-tab';
import { Icon } from '../../ui/icon/icon';
import { SaveCardContentSmall } from '../../ui/save-card/save-card-content-small';
import { StorageDetailsBase } from '../../ui/storage-item-details/storage-details-base';
import { StorageDetailsForm } from '../../ui/storage-item-details/storage-details-form';
import { TextContainer } from '../../ui/text-container/text-container';
import { theme } from '../../ui/theme';
import { switchUtilRequired } from '../../util/switch-util';

export type StorageDetailsMainProps = {
    selectedId: string;
};

export const StorageDetailsMain: React.FC<StorageDetailsMainProps> = ({ selectedId }) => {
    const selectedContext = Route.useSearch({ select: search => search.selectedContext });

    const navigate = Route.useNavigate();

    const variantInfos = usePkmVariantSlotInfos(selectedId);

    const pkmLegalityMapQuery = usePkmLegalityMap(variantInfos?.variants.map(pkm => pkm.id) ?? []);
    const pkmLegalityMap = pkmLegalityMapQuery.data?.data ?? {};

    if (!variantInfos) {
        return null;
    }

    const { variants } = variantInfos;

    const selectedPkm = selectedContext
        ? variants.find(v => v.context === selectedContext) ?? variants[ 0 ]
        : variants[ 0 ];

    const selectContext = (context: EntityContext) => {
        navigate({
            search: (search) => ({
                ...search,
                selectedContext: context,
            }),
        });
    };

    if (!selectedPkm) {
        return null;
    }

    return (
        <StorageDetailsForm.Provider key={selectedPkm.id} nickname={selectedPkm.nickname} eVs={selectedPkm.eVs} moves={selectedPkm.moves}>
            <InnerStorageDetailsMain
                id={selectedPkm.id}
                tabs={<>
                    {variants.map((pkmVariant) => (
                        <DetailsTab
                            key={pkmVariant.id}
                            isEnabled={pkmVariant.isEnabled}
                            contextVersion={pkmVariant.isEnabled ? pkmVariant.contextVersion : null}
                            otName={getEntityContextGenerationName(pkmVariant.context, true)}
                            original={pkmVariant.isMain}
                            onClick={() => selectContext(pkmVariant.context)}
                            disabled={selectedPkm?.id === pkmVariant.id}
                            warning={!pkmLegalityMap[ pkmVariant.id ]?.isValid}
                        />
                    ))}
                </>}
            />
        </StorageDetailsForm.Provider>
    );
};

const InnerStorageDetailsMain: React.FC<{ id: string; tabs: React.ReactNode }> = ({ id, tabs }) => {
    const { t } = useTranslate();

    const selectExpanded = Route.useSearch({ select: search => search.selectExpanded ?? 'none' });

    const navigate = Route.useNavigate();

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

    const setSelectExpanded = (state: DetailsExpandedState) => {
        navigate({
            search: (search) => ({
                ...search,
                selectExpanded: state,
            }),
        });
    };

    if (!pkmVariant) {
        return null;
    }

    return (
        <StorageDetailsBase
            tabs={tabs}
            {...pkmVariant}
            contextVersion={pkmVariant.isEnabled ? pkmVariant.contextVersion : null}
            isValid
            movesLegality={[]}
            relearnMovesLegality={[]}
            {...pkmLegality}
            saveId={undefined}
            idBase={pkmVariant.id}
            reports={<>
                {pkmVariant.isExternal && <TextContainer
                    bgColor={theme.bg.dark}
                    maxHeight={200}
                    className={css({
                        minHeight: '1lh',
                        flexShrink: 0.1,
                    })}
                >
                    <Icon name='external-link' forButton />{' '}
                    {t('details.external-pkm-file.1')}
                    <PathLine>{pkmVariant.filepathAbsolute}</PathLine>
                    <br />
                    {t('details.external-pkm-file.2')}
                </TextContainer>}

                {pkmVariant.loadError && !pkmVariant.isEnabled && <TextContainer
                    bgColor={theme.bg.red}
                    maxHeight={200}
                    className={css({
                        minHeight: '1lh',
                        flexShrink: 0.1,
                    })}
                >
                    {!pkmVariant.isEnabled && t('details.is-disabled')}
                    <br />
                    <br />
                    {pkmVariant.loadError && t('details.load-error', {
                        loadError: switchUtilRequired(pkmVariant.loadError, {
                            [ PKMLoadError.UNKNOWN ]: t('details.load-error.0'),
                            [ PKMLoadError.NOT_LOADED ]: t('details.load-error.0'),
                            [ PKMLoadError.NOT_FOUND ]: t('details.load-error.1'),
                            [ PKMLoadError.TOO_SMALL ]: t('details.load-error.2'),
                            [ PKMLoadError.TOO_BIG ]: t('details.load-error.3'),
                            [ PKMLoadError.UNAUTHORIZED ]: t('details.load-error.4'),
                        }),
                        filepath: pkmVariant.filepath,
                    })}
                </TextContainer>}

                {pkmVariant.isEnabled && !getPkmVariantAttach(pkmVariant, pkmVariant.id).isAttachedValid && <TextContainer
                    bgColor={theme.bg.yellow}
                    maxHeight={200}
                    className={css({
                        minHeight: '1lh',
                        flexShrink: 0.1,
                    })}
                >
                    {t('details.attached-pkm-not-found.1')}
                    <br />
                    <br />
                    {t('details.attached-pkm-not-found.2')}
                </TextContainer>}

                {pkmVariant.isEnabled && pkmLegality && pkmLegality.illegalitiesCount > 0 && pkmLegality.validityReport && <TextContainer
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
            expanded={selectExpanded}
            setExpanded={setSelectExpanded}
        />
    );
};
