import React from "react";
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UIAutocomplete } from '../../../ui-new/form/select/ui-autocomplete';

export const FilterSpecies: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({
    select: (search) => search.filterSpeciesName ?? "",
  });
  const timeoutRef = React.useRef<NodeJS.Timeout>(null);

  const [ value, setValue ] = React.useState(searchValue);

  return <UIAutocomplete
    name='filter-species'
    label={t('dex.filters.name')}
    value={value}
    onChange={(value) => {
      setValue(value);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        navigate({
          search: {
            filterSpeciesName: value,
          },
        });
      }, 500);
    }}
    // size='xs'
    data={[ 'foo', 'bar' ]}
    limit={5}
    selectFirstOptionOnChange
    comboboxProps={{
      position: 'right-start'
    }}
    w='100%'
  />;
};
