import { Badge, Tooltip } from '@mantine/core';
import { t } from 'i18next';
import { CircleSmallIcon } from 'lucide-react';
import type React from 'react';
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { usePkmLegality } from '../../data/hooks/use-pkm-legality';
import { Gender, type PkmVariantDTO } from '../../data/sdk/model';
import { useStorageMainSetPkmVariantMain } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { BallImg } from '../../img/ball-img';
import { ItemImg } from '../../img/item-img';
import { SpeciesImg } from '../../img/species-img';
import { Route } from '../../routes/storage';
import { UIButton } from '../../ui/form/button/ui-button';
import { UIMarkingList } from '../../ui/storage/storage-details/marking/ui-marking-list';
import { UIDetailsMain } from '../../ui/storage/storage-details/ui-details-main';
import { useCurrentStorage } from '../panel/storage-panel-context';
import { DetailsAttachedButton } from './details-attached-button';
import { TypeItem } from './type-item/type-item';

export const DetailsMain: React.FC = () => {
    const staticData = useStaticData();

    const { getSelected } = useCurrentStorage();
    const selectedSaveId = Route.useSearch({ select: search => getSelected(search.selected)?.saveId });
    const selectedId = Route.useSearch({ select: search => getSelected(search.selected)?.id });

    const pkmIndexQuery = usePkmIndex(selectedSaveId ?? null, data => data.data.byId[ selectedId ?? '' ]);
    const pkm = pkmIndexQuery.data;

    const pkmLegalityQuery = usePkmLegality(selectedId, selectedSaveId ?? undefined);
    const pkmLegality = pkmLegalityQuery.data?.data;

    const setPkmVariantMainMutation = useStorageMainSetPkmVariantMain();

    if (!pkm)
        return null;

    const staticForms = staticData.species[ pkm.species ]?.forms[ pkm.context ];
    const formObj = staticForms?.[ pkm.form ] ?? staticForms?.[ 0 ];
    const speciesName = formObj?.name ?? '';

    const ballName = staticData.getItem(pkm.version, pkm.ball)?.name;

    return <UIDetailsMain
        saveId={selectedSaveId}
        species={pkm.species}
        speciesName={speciesName}
        gender={pkm.gender}
        isEnabled={pkm.isEnabled}
        isShiny={pkm.isShiny}
        isAlpha={pkm.isAlpha}
        isN={pkm.nSparkle}
        types={pkm.types.map(type => <TypeItem key={type} type={type} />)}
        markings={pkm.markings && <UIMarkingList markings={pkm.markings} />}
        teraType={pkm.teraType !== undefined ? <TypeItem type={pkm.teraType} /> : null}
        ball={<Tooltip label={ballName} disabled={!ballName}>
            <BallImg item={pkm.ball} />
        </Tooltip>}
        nickname={pkm.nickname}
        level={pkm.level}
        // eggHatchCount={pkm.eggHatchCount}
        pokerusDays={pkm.pokerusDays}
        isPokerusCured={pkm.isPokerusCured}
        canEvolve={pkm.canEvolve}
        isDuplicate={pkm.isDuplicate}
        warning={!!pkmLegality && !pkmLegality.isValid}
        main={!selectedSaveId && <Tooltip
            label={t('details.main.description')}
        >
            {(pkm as PkmVariantDTO).isMain
                ? <Badge
                    variant='dot'
                    h={22}
                >
                    {t('details.main')}
                </Badge>
                : <UIButton
                    name='main-pkm'
                    controlLabel={t('action.select')}
                    onClick={() => setPkmVariantMainMutation.mutateAsync({
                        pkmVariantId: pkm.id
                    })}
                    size='compact-xs'
                    leftSection={<CircleSmallIcon />}
                    disabled={!pkm.canEdit}
                >
                    {t('storage.actions.main')}
                </UIButton>}
        </Tooltip>}
        heldItem={pkm.heldItem > 0
            ? <ItemImg item={pkm.heldItem} version={pkm.contextVersion} />
            : null}
        attachedBtn={<DetailsAttachedButton />}
    >
        <SpeciesImg
            species={pkm.species}
            context={pkm.context}
            form={pkm.form}
            isFemale={pkm.gender === Gender.Female}
            isShiny={pkm.isShiny}
            isEgg={pkm.isEgg}
            isShadow={pkm.isShadow}
        />
    </UIDetailsMain>;
};
