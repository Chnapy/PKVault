import React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from "../../routes/pokedex";
import { DetailsCardContainer } from '../../ui/details-card/details-card-container';
import { DetailsMainImg } from '../../ui/details-card/details-main-img';
import { DetailsMainInfos } from '../../ui/details-card/details-main-infos';
import { DetailsTab } from '../../ui/details-card/details-tab';
import { DetailsTitle } from '../../ui/details-card/details-title';
import { TextContainer } from '../../ui/text-container/text-container';
import { theme } from '../../ui/theme';
import { PokedexDetailsOwned } from './pokedex-details-owned';
import { getGameInfos } from './util/get-game-infos';

export const PokedexDetails: React.FC = () => {
  // console.time("pokedex-details");
  const selectedSpecies = Route.useSearch({
    select: (search) => search.selected,
  });
  const navigate = Route.useNavigate();

  const staticData = useStaticData();

  const dexGetAllQuery = useDexGetAll();
  const saveInfosMainQuery = useSaveInfosGetAll();

  const [ selectedSaveIndex, setSelectedSaveIndex ] = React.useState(0);

  const savesRecord = saveInfosMainQuery.data?.data ?? {};
  const speciesRecord = dexGetAllQuery.data?.data ?? {};

  const speciesValues = Object.values(
    speciesRecord[ selectedSpecies + "" ] ?? {}
  );

  const gameSaves = speciesValues
    .filter((spec) => spec.isAnySeen)
    .map((spec) => savesRecord[ spec.saveId ])
    .filter(Boolean);

  React.useEffect(() => {
    if (selectedSaveIndex > 0 && !gameSaves[ selectedSaveIndex ]) {
      setSelectedSaveIndex(0);
    }
  }, [ gameSaves, selectedSaveIndex ]);

  if (!selectedSpecies || !gameSaves.length) {
    // console.timeEnd("pokedex-details");
    return null;
  }

  const selectedSave = gameSaves[ selectedSaveIndex ] ?? gameSaves[ 0 ];
  const selectedSpeciesValue = speciesValues.find(
    (value) => value.saveId === selectedSave.id
  )!;

  const caught = selectedSpeciesValue.isCaught;
  const owned = selectedSpeciesValue.isOwned;
  const ownedShiny = selectedSpeciesValue.isOwnedShiny;

  const { name: speciesName, genders } = staticData.species[ selectedSpecies ];

  const baseStats = selectedSpeciesValue.baseStats;
  const totalBaseStats = baseStats.reduce((acc, stat) => acc + stat, 0);
  const cellBaseStyle: React.CSSProperties = { padding: 0, textAlign: 'center' };

  // console.timeEnd("pokedex-details");

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '0 4px',
          padding: '0 8px',
          flexWrap: 'wrap-reverse',
        }}
      >
        {gameSaves.map((save, i) => (
          <DetailsTab
            key={save.id}
            version={save.version}
            otName={save.trainerName}
            onClick={() => setSelectedSaveIndex(i)}
            disabled={selectedSaveIndex === i}
          />
        ))}
      </div>

      <DetailsCardContainer
        bgColor={getGameInfos(selectedSave.version).color}
        title={<DetailsTitle
          version={selectedSave.version}
          showVersionName
        />}
        mainImg={
          <DetailsMainImg
            species={selectedSpecies}
            isOwned={owned}
            isShiny={ownedShiny}
            ball={caught ? staticData.itemPokeball.id : undefined}
          />
        }
        mainInfos={
          <DetailsMainInfos
            species={selectedSpecies}
            speciesName={speciesName}
            genders={genders}
            types={selectedSpeciesValue.types}
          />
        }
        preContent={null}
        content={<>
          {/* {selectedSpeciesValue.description && (
          <div style={{ display: "flex" }}>
            <TextContainer>{description}</TextContainer>
          </div>
        )} */}

          {selectedSpeciesValue.abilities.length > 0 && <TextContainer>
            <span style={{ color: theme.text.primary }}>Abilities</span><br />
            {selectedSpeciesValue.abilities.map(ability => <div key={ability}>{
              staticData.abilities[ ability ].name
            }</div>)}
            {/* {abilitiesHidden.map(ability => <div key={ability}>{ability} (caché)</div>)} */}
          </TextContainer>}

          <TextContainer>
            <table
              style={{
                borderSpacing: '8px 0'
              }}
            >
              <thead>
                <tr>
                  <td style={cellBaseStyle}></td>
                  <td style={cellBaseStyle}>Base stats</td>
                </tr>
              </thead>
              <tbody>
                {[ 'HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe' ]
                  .map((statName, i) => <tr key={statName}>
                    <td style={{ ...cellBaseStyle, textAlign: 'left' }}>{statName}</td>
                    <td style={cellBaseStyle}>{baseStats[ i ]}</td>
                  </tr>)}

                <tr>
                  <td style={{ ...cellBaseStyle, textAlign: 'left' }}>Total</td>
                  <td style={cellBaseStyle}>{totalBaseStats}</td>
                </tr>
              </tbody>
            </table>
          </TextContainer>

          {selectedSpeciesValue.isOwned && (
            <PokedexDetailsOwned saveId={selectedSpeciesValue.saveId} species={selectedSpeciesValue.species} />
          )}
        </>}
        actions={null}
        onClose={() => navigate({
          search: {
            selected: undefined,
          }
        })}
      />
    </div>
  );
};
