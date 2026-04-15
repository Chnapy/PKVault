import React from 'react';
import { useDexGetAll } from '../../../data/sdk/dex/dex.gen';
import { EntityContext, type DexItemForm } from '../../../data/sdk/model';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from '../../../routes/pokedex';
import { filterIsDefined } from '../../../util/filter-is-defined';

export const usePokedexDetailsSelect = () => {
    const selectedSpecies = Route.useSearch({ select: search => search.selected });
    const selectedSaveId = Route.useSearch({ select: search => search.selectedSaveId });

    const navigate = Route.useNavigate();

    const staticData = useStaticData();

    const dexGetAllQuery = useDexGetAll();
    const saveInfosMainQuery = useSaveInfosGetAll();

    const [ selectedFormId, setSelectedFormId ] = React.useState('');

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

    const setSelectedSaveId = React.useCallback((saveId: number | undefined) => {
        navigate({
            search: (search) => ({
                ...search,
                selectedSaveId: saveId,
            }),
        });
    }, [ navigate ]);

    const selectedSaveIfAny = selectedSaveId !== undefined
        ? gameSaves.find(save => save.id === selectedSaveId)
        : undefined;

    const selectedSave = selectedSaveIfAny ?? gameSaves[ 0 ];

    const selectedSpeciesValue = selectedSave && speciesValues.find(
        (value) => value.saveId === selectedSave.id
    )!;

    const staticForms = selectedSpecies && selectedSave ? staticData.species[ selectedSpecies ]?.forms[ selectedSave.context ] ?? [] : [];
    const staticFormsFiltered = staticForms
        .map((staticForm, index) => ({ ...staticForm, index }))
        .filter(staticForm => !staticForm.isBattleOnly);

    const getFormWeight = (f: DexItemForm) =>
        (f.isOwned ? 100000 : 0)
        + (f.isCaught ? 10000 : 0)
        + (f.isSeenShiny ? 1000 : 0)
        + (f.isSeenAlpha ? 100 : 0);

    const seenForms = selectedSpeciesValue?.forms.filter(form => form.isSeen) ?? [];

    const getDefaultForm = (formIndex: number) => {
        const formsSortedByWeight = [ ...seenForms ]
            .filter(form => form.form === formIndex)
            .sort((f1, f2) => getFormWeight(f2) - getFormWeight(f1));
        return formsSortedByWeight[ 0 ];
    };

    const selectedForm = selectedFormId
        ? seenForms.find(form => form.id === selectedFormId) ?? getDefaultForm(0)
        : getDefaultForm(0);

    const selectedFormIndexForms = (seenForms ?? [])
        .filter(form => form.form === selectedForm?.form)
        .sort((f1, f2) => getFormWeight(f2) - getFormWeight(f1));

    const selectedByFormIndex = (formIndex: number) => {
        const form = getDefaultForm(formIndex);
        if (form)
            setSelectedFormId(form.id);
    };

    if (!selectedSpecies || !gameSaves.length || !selectedSave || !selectedSpeciesValue || !selectedForm) {
        return null;
    }

    const selectedStaticFormWithIndex = staticFormsFiltered.find(sf => sf.index === selectedForm.form)
        ?? staticFormsFiltered[ 0 ];

    if (!selectedStaticFormWithIndex) {
        return null;
    }

    return {
        selectedSaveId,
        selectedSpecies,
        selectedSave,
        selectedForm,

        setSelectedSaveId,
        setSelectedFormId,
        selectedByFormIndex,

        selectedFormIndexForms,
        selectedStaticFormWithIndex,
        selectedSpeciesValue,

        gameSaves,
        staticFormsFiltered,
    };
};
