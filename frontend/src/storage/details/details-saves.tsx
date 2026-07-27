import type React from 'react';
import { usePkmLegalityMap } from '../../data/hooks/use-pkm-legality';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageMainCreatePkmVariant } from '../../data/sdk/storage/storage.gen';
import { getEntityContextGenerationName } from '../../data/util/get-entity-context-generation-name';
import { Route } from '../../routes/storage';
import { UIDetailsSaves, type UIDetailsSavesProps } from '../../ui/storage/storage-details/saves/ui-details-saves';
import { DetailsTab } from './details-card/details-tab';
import { DetailsTabCreate } from './details-card/details-tab-create';
import { filterIsDefined } from '../../util/filter-is-defined';
import { pick } from '../../util/pick';
import { useSelectCallback } from '../../util/use-select-callback';
import { useCurrentStorage } from '../panel/storage-panel-context';

type DetailsSavesProps = Pick<UIDetailsSavesProps, 'actions'>;

export const DetailsSaves: React.FC<DetailsSavesProps> = ({ actions }) => {
    const { getSelected, storageIndex } = useCurrentStorage();
    const selectedSaveId = Route.useSearch({ select: search => getSelected(search.selected)?.saveId });
    const selectedId = Route.useSearch({ select: search => getSelected(search.selected)?.id });
    const otherStorageSaveId = Route.useSearch({ select: search => search.storages?.[ (storageIndex + 1) % 2 ]?.saveId }) ?? null;

    const navigate = Route.useNavigate();

    const savesInfosQuery = useSaveInfosGetAll();
    const otherStorageSave = otherStorageSaveId ? savesInfosQuery.data?.data[ otherStorageSaveId ] : undefined;

    const mainCreatePkmVariantMutation = useStorageMainCreatePkmVariant();

    const variantsQuery = usePkmVariantIndex(
        useSelectCallback(data => {
            if (selectedSaveId || !selectedId)
                return;

            const baseVariant = data.data.byId[ selectedId ];
            if (!baseVariant)
                return;

            const variants = data.data.byBox[ baseVariant.boxId ]?.[ baseVariant.boxSlot ] ?? [];
            const mainVariant = variants.find(v => v.isMain);

            const getCanCreateVariantContext = () => {
                if (!mainVariant?.canCreateVariant || !otherStorageSave)
                    return;

                const attachedVariant = variants.find(v => v.attachedSaveId);
                if (attachedVariant)
                    return;

                const hasPkmForPageSaveContext = variants.some(variant => variant.context === otherStorageSave.context);
                const isCompatibleWithPageSave = mainVariant.compatibleWithVersions.includes(otherStorageSave.version);

                if (isCompatibleWithPageSave && !hasPkmForPageSaveContext)
                    return otherStorageSave.context;
            };

            return {
                variants: variants.map(pkm =>
                    pick(pkm, [ 'id', 'context', 'isMain' ])
                ),
                mainVariant: mainVariant && pick(mainVariant, [ 'id', 'boxId', 'boxSlot', 'compatibleWithVersions', 'canCreateVariant' ]),
                canCreateVariantContext: getCanCreateVariantContext(),
            };
        }, [ otherStorageSave, selectedId, selectedSaveId ])
    );
    const { variants = [], mainVariant, canCreateVariantContext } = variantsQuery.data ?? {};

    const pkmLegalityMapQuery = usePkmLegalityMap(variants.map(pkm => pkm.id) ?? []);
    const pkmLegalityMap = pkmLegalityMapQuery.data?.data ?? {};

    const getSaveProps = (saveId: number): UIDetailsSavesProps => {
        return {
            value: selectedId ?? '',
            data: [
                {
                    id: selectedId ?? '',
                    label: '',
                    imgSrc: '',
                },
            ],
            onSelect: () => void 0,
            actions,
            renderTab: ({ item, selected }) => <DetailsTab
                key={item.id}
                id={item.id}
                saveId={saveId}
                selected={selected}
            />,
        };
    };

    const getMainProps = (): UIDetailsSavesProps => {
        const firstVariant = variants[ 0 ];

        const data = [
            ...variants.map((variant) => ({
                id: variant.id,
                label: getEntityContextGenerationName(variant.context, true),
                imgSrc: '',
            })),
            canCreateVariantContext
                ? {
                    id: canCreateVariantContext.toString(),
                    label: '',
                    imgSrc: '',
                }
                : undefined,
        ].filter(filterIsDefined);

        return {
            value: selectedId ?? firstVariant?.id ?? '',
            data,
            onSelect: async id => {
                if (id === canCreateVariantContext?.toString()) {
                    if (!mainVariant)
                        return;

                    const mutateResult = await mainCreatePkmVariantMutation.mutateAsync({
                        params: {
                            context: canCreateVariantContext,
                            pkmVariantId: mainVariant.id,
                        },
                    });

                    const pkms = Object.values(mutateResult.data.mainPkmVariants?.data ?? {});
                    const newPkm = pkms.find(p => p.boxId === mainVariant.boxId && p.boxSlot === mainVariant.boxSlot);
                    if (!newPkm)
                        return;

                    navigate({
                        search: (search) => ({
                            ...search,
                            selected: {
                                ...search.selected!,
                                id: newPkm.id,
                            },
                            selectedContext: newPkm.context,
                        }),
                    });

                } else {
                    navigate({
                        search: (search) => ({
                            ...search,
                            selected: {
                                ...search.selected!,
                                id,
                            },
                            selectedContext: variants.find(variant => variant.id === id)?.context,
                        }),
                    });
                }
            },
            renderTab: ({ item, selected }) => item.id === canCreateVariantContext?.toString()
                ? <DetailsTabCreate
                    key={item.id}
                    context={canCreateVariantContext}
                    version={otherStorageSave!.displayedVersion}
                    loading={mainCreatePkmVariantMutation.isPending}
                />
                : <DetailsTab
                    key={item.id}
                    id={item.id}
                    saveId={null}
                    selected={selected}
                    warning={!!pkmLegalityMap[ item.id ] && !pkmLegalityMap[ item.id ]!.isValid}
                />,
            actions,
        };
    };

    const props = selectedSaveId
        ? getSaveProps(selectedSaveId)
        : getMainProps();

    return <UIDetailsSaves
        {...props}
    />;
};
