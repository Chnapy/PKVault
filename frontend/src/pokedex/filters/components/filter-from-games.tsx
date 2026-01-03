import React from "react";
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";
import { filterIsDefined } from '../../../util/filter-is-defined';
import { getGameInfos } from '../../details/util/get-game-infos';

export const FilterFromGames: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filterFromGames })?.map(
      String
    ) ?? [];

  const { versions } = useStaticData();

  const saveInfosQuery = useSaveInfosGetAll();

  const options = [
    {
      value: '0',
      label: <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <img
          src={getGameInfos(null).img}
          style={{
            height: 14,
            width: 14,
          }}
        />
        PKVault
      </div>
    },
    ...Object.values(saveInfosQuery.data?.data ?? {})
      .filter(filterIsDefined)
      .map((save) => {
        const name = versions[ save.version ]?.name;

        return {
          value: save.id + "",
          label: <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <img
              src={getGameInfos(save.version).img}
              style={{
                height: 14,
                width: 14,
              }}
            />
            {name} - {save.trainerName}
          </div>
        };
      })
  ];

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
      <img
        src={getGameInfos(null).img}
        style={{
          height: 14,
          width: 14,
        }}
      />
      {t('dex.filters.games')}
    </FilterSelect>
  );
};
