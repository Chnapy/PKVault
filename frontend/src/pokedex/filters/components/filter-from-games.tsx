import React from "react";
import { Route } from "../../../routes/pokedex";
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";
import { useSaveInfosGetAll } from "../../../data/sdk/save-infos/save-infos.gen";
import { getGameInfos } from "../../details/util/get-game-infos";

export const FilterFromGames: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filters.fromGames })?.map(
      String
    ) ?? [];

  const saveInfosQuery = useSaveInfosGetAll();

  const options = Object.values(saveInfosQuery.data?.data ?? {})
    .map((saves) => saves[0])
    .map((save) => {
      const infos = getGameInfos(save.version);

      return {
        value: save.id + "",
        label: `${infos.text} - ${save.trainerName}`,
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
            filters: {
              fromGames: fromGames.map(Number),
            },
          },
        });
      }}
      options={options}
    >
      From games
    </FilterSelect>
  );
};
