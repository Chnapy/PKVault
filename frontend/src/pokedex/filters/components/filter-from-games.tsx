import React from "react";
import { Route } from "../../../routes/pokedex";
import { useSaveInfosMain } from '../../../saves/hooks/use-save-infos-main';
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";
import { getGameInfos } from "../../details/util/get-game-infos";

export const FilterFromGames: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filterFromGames })?.map(
      String
    ) ?? [];

  const saveInfosQuery = useSaveInfosMain();

  const options = Object.values(saveInfosQuery.data?.data ?? {})
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
