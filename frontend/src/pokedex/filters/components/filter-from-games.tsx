import React from "react";
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";

export const FilterFromGames: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filterFromGames })?.map(
      String
    ) ?? [];

  const { versions } = useStaticData();

  const saveInfosQuery = useSaveInfosGetAll();

  const options = Object.values(saveInfosQuery.data?.data ?? {})
    .map((save) => {
      const name = versions[ save.version ].name;

      return {
        value: save.id + "",
        label: `${name} - ${save.trainerName}`,
      };
    });

  return (
    <FilterSelect
      enabled={searchValue.length > 0}
      multiple
      value={searchValue}
      onChange={(fromGames) => {
        navigate({
          search: {
            filterFromGames: fromGames.map(Number),
          },
        });
      }}
      options={options}
    >
      From games
    </FilterSelect>
  );
};
