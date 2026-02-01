import React from 'react';
import { EntityContext, Gender as GenderType } from '../../../data/sdk/model';
import { Route } from '../../../routes/pokedex';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { useStaticData } from '../../../hooks/use-static-data';
import { useDexGetAll } from '../../../data/sdk/dex/dex.gen';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';

export const usePokedexDetailsSelect = () => {
    const selectedSpecies = Route.useSearch({
        select: (search) => search.selected,
    });

    const staticData = useStaticData();

    const dexGetAllQuery = useDexGetAll();
    const saveInfosMainQuery = useSaveInfosGetAll();

    const [ selectedSaveIndex, setSelectedSaveIndex ] = React.useState(0);
    const [ selectedFormIndex, setSelectedFormIndex ] = React.useState(0);
    const [ selectedGender, setSelectedGender ] = React.useState<GenderType>(GenderType.Genderless);
    const [ selectedShiny, setSelectedShiny ] = React.useState(false);

    const savesRecord = saveInfosMainQuery.data?.data ?? {};
    const speciesRecord = dexGetAllQuery.data?.data ?? {};

    const speciesValues = Object.values(
        speciesRecord[ selectedSpecies + "" ] ?? {}
    );

    const gameSaves = speciesValues
        .filter((spec) => spec.forms.some(form => form.isSeen))
        .map((spec) => spec.saveId === 0
            // pkvault storage
            ? {
                id: 0,
                context: EntityContext.Gen9a,
                version: null,
                trainerName: ''
            }
            : savesRecord[ spec.saveId ])
        .filter(filterIsDefined);

    const selectedSave = gameSaves[ selectedSaveIndex ] ?? gameSaves[ 0 ];
    const selectedSpeciesValue = selectedSave && speciesValues.find(
        (value) => value.saveId === selectedSave.id
    )!;

    const staticForms = selectedSpecies && selectedSave ? staticData.species[ selectedSpecies ]?.forms[ selectedSave.context ] ?? [] : [];
    const staticFormsFiltered = staticForms
        .map((staticForm, index) => ({ ...staticForm, index }))
        .filter(staticForm => !staticForm.isBattleOnly);

    const firstSeenForm = selectedSpeciesValue?.forms.find(form =>
        form.isSeen && staticFormsFiltered.some(staticForm => staticForm.index === form.form)
    )?.form;
    const firstSeenGender = selectedSpeciesValue?.forms.find(form => form.form === firstSeenForm && form.isSeen)?.gender;

    const selectedForm = selectedSpeciesValue?.forms.find(form =>
        form.form === selectedFormIndex
        && form.gender === selectedGender
    );

    React.useEffect(() => {
        if (selectedSaveIndex > 0 && !gameSaves[ selectedSaveIndex ]) {
            setSelectedSaveIndex(0);
            setSelectedFormIndex(0);
            setSelectedGender(GenderType.Genderless);
            setSelectedShiny(false);
        }
    }, [ gameSaves, selectedSaveIndex ]);

    React.useEffect(() => {
        if (!selectedForm?.isSeen) {
            setSelectedFormIndex(firstSeenForm ?? 0);
            setSelectedGender(firstSeenGender ?? GenderType.Genderless);
        }

        if (!selectedForm?.isSeenShiny) {
            setSelectedShiny(false);
        }
    }, [ firstSeenForm, firstSeenGender, selectedSpecies, selectedForm ]);

    React.useEffect(() => {
        if (selectedFormIndex > 0 && !selectedForm) {
            setSelectedFormIndex(firstSeenForm ?? 0);
            setSelectedGender(firstSeenGender ?? GenderType.Genderless);
        }
    }, [ selectedFormIndex, selectedForm, firstSeenGender, firstSeenForm ]);

    if (!selectedSpecies || !gameSaves.length || !selectedSave || !selectedSpeciesValue || !selectedForm) {
        return null;
    }

    const selectedStaticFormWithIndex = staticFormsFiltered.find(sf => sf.index === selectedFormIndex)
        ?? staticFormsFiltered[ 0 ];

    if (!selectedStaticFormWithIndex) {
        return null;
    }

    return {
        selectedSaveIndex,
        selectedFormIndex,
        selectedGender,
        selectedShiny,

        setSelectedSaveIndex,
        setSelectedFormIndex,
        setSelectedGender,
        setSelectedShiny,

        selectedSpecies,
        selectedSave,
        selectedForm,
        selectedStaticFormWithIndex,
        selectedSpeciesValue,

        gameSaves,
        staticFormsFiltered,
    };
};
