import type React from 'react';
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { Gender } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { UIMarkingList } from '../../ui-new/storage/storage-details/marking/ui-marking-list';
import { UIDetailsMain } from '../../ui-new/storage/storage-details/ui-details-main';
import { BallImg } from '../../ui/img/ball-img';
import { ItemImg } from '../../ui/img/item-img';
import { SpeciesImg } from '../../ui/img/species-img';
import { TypeItem } from '../../ui/type-item/type-item';
import { useCurrentStorage } from '../panel/storage-panel-context';

export const DetailsMain: React.FC = () => {
    const staticData = useStaticData();

    const { getSelected } = useCurrentStorage();
    const selectedSaveId = Route.useSearch({ select: search => getSelected(search.selected)?.saveId });
    const selectedId = Route.useSearch({ select: search => getSelected(search.selected)?.id });

    const pkmIndexQuery = usePkmIndex(selectedSaveId ?? null, data => data.data.byId[ selectedId ?? '' ]);

    const pkm = pkmIndexQuery.data;
    if (!pkm)
        return null;

    const staticForms = staticData.species[ pkm.species ]?.forms[ pkm.context ];
    const formObj = staticForms?.[ pkm.form ] ?? staticForms?.[ 0 ];
    const speciesName = formObj?.name ?? '';

    return <UIDetailsMain
        species={pkm.species}
        speciesName={speciesName}
        gender={pkm.gender}
        isShiny={pkm.isShiny}
        isAlpha={pkm.isAlpha}
        types={pkm.types.map(type => <TypeItem key={type} type={type} />)}
        markings={pkm.markings && <UIMarkingList markings={pkm.markings} />}
        teraType={pkm.teraType !== undefined ? <TypeItem type={pkm.teraType} /> : null}
        ball={<BallImg item={pkm.ball} />}
        nickname={pkm.nickname}
        level={pkm.level}
        eggHatchCount={pkm.eggHatchCount}
        pokerusDays={pkm.pokerusDays}
        isPokerusCured={pkm.isPokerusCured}
        heldItem={pkm.heldItem > 0
            ? <ItemImg item={pkm.heldItem} version={pkm.contextVersion} />
            : null}
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
