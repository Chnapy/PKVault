import { Group, type ComboboxItem, type OptionsFilter } from '@mantine/core';
import React, { startTransition } from "react";
import { EntityContext } from '../../../data/sdk/model';
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UIAutocomplete } from '../../../ui/form/select/ui-autocomplete';
import { UISpriteSizeWrapper } from '../../../ui/sprite-img/ui-sprite-size-wrapper';
import { SpeciesImg } from '../../../img/species-img';

export const FilterSpecies: React.FC = () => {
  const { t } = useTranslate();

  const staticData = useStaticData();

  const allSpecies = React.useMemo(() => Object.values(staticData.species)
    .map(species => [ species.id, Object.values(species.forms)[ 0 ]?.find(f => !f.isBattleOnly)?.name ] as const)
    .filter((v): v is [ number, string ] => typeof v[ 1 ] === 'string'),
    [ staticData.species ]);

  const search: OptionsFilter = ({ search, options: _options, limit }) => {
    search = search.trim().toLowerCase();
    const options = _options as ComboboxItem[];

    const speciesId = +search;

    if (!Number.isNaN(speciesId))
      return options.filter(({ value }) => value.includes(search))
        .sort((v1, v2) => v1.value.startsWith(search)
          ? v2.value.startsWith(search)
            ? 0
            : -1
          : 1)
        .slice(0, limit);

    return options.filter(({ label }) => label.toLowerCase().includes(search))
      .sort((v1, v2) => v1.label.toLowerCase().startsWith(search)
        ? v2.label.toLowerCase().startsWith(search)
          ? 0
          : -1
        : 1)
      .slice(0, limit);
  };

  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({
    select: (search) => search.filterSpeciesName ?? "",
  });
  const timeoutRef = React.useRef<NodeJS.Timeout>(null);

  const [ value, setValue ] = React.useState(searchValue);

  const data = value
    ? allSpecies.map(([ species, name ]): ComboboxItem => ({
      value: species.toString(),
      label: name,
    }))
    : undefined;

  return <UIAutocomplete
    name='filter-species'
    label={t('dex.filters.species')}
    value={value}
    onChange={(value) => {
      setValue(value);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        startTransition(() => navigate({
          search: {
            filterSpeciesName: value,
          },
        }));
      }, 500);
    }}
    data={data}
    filter={search}
    renderOption={opt => {
      const species = +opt.option.value;
      const name = (opt.option as ComboboxItem).label;

      return <UISpriteSizeWrapper component={Group} speciesSize='xs'>
        <SpeciesImg species={species} context={EntityContext.Gen9a} form={0} />

        <span>
          #{species} - {name}
        </span>
      </UISpriteSizeWrapper>;
    }}
    limit={6}
    selectFirstOptionOnChange
    clearable
    comboboxProps={{
      position: 'right-start'
    }}
    w='100%'
  />;
};
