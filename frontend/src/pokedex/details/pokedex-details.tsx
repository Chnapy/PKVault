import React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import type { DexItemForm, SaveInfosDTO } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from "../../routes/pokedex";
import { useTranslate } from '../../translate/i18n';
import { DetailsCardContainer } from '../../ui/details-card/details-card-container';
import { DetailsMainImg } from '../../ui/details-card/details-main-img';
import { DetailsMainInfos } from '../../ui/details-card/details-main-infos';
import { DetailsTab } from '../../ui/details-card/details-tab';
import { DetailsTitle } from '../../ui/details-card/details-title';
import { SelectNumberInput } from '../../ui/input/select-input';
import { TextContainer } from '../../ui/text-container/text-container';
import { theme } from '../../ui/theme';
import { PokedexDetailsOwned } from './pokedex-details-owned';
import { getGameInfos } from './util/get-game-infos';

export const PokedexDetails: React.FC = () => {
  // console.time("pokedex-details");
  const { t } = useTranslate();

  const selectedSpecies = Route.useSearch({
    select: (search) => search.selected,
  });
  const navigate = Route.useNavigate();

  const staticData = useStaticData();

  const dexGetAllQuery = useDexGetAll();
  const saveInfosMainQuery = useSaveInfosGetAll();

  const [ selectedSaveIndex, setSelectedSaveIndex ] = React.useState(0);
  const [ selectedFormIndex, setSelectedFormIndex ] = React.useState(0);

  const savesRecord = saveInfosMainQuery.data?.data ?? {};
  const speciesRecord = dexGetAllQuery.data?.data ?? {};

  const speciesValues = Object.values(
    speciesRecord[ selectedSpecies + "" ] ?? {}
  );

  const gameSaves = speciesValues
    .filter((spec) => spec.forms.some(form => form.isSeen))
    .map((spec) => savesRecord[ spec.saveId ])
    .filter(Boolean);

  const selectedSave = (gameSaves[ selectedSaveIndex ] ?? gameSaves[ 0 ]) as SaveInfosDTO | undefined;
  const selectedSpeciesValue = selectedSave && speciesValues.find(
    (value) => value.saveId === selectedSave.id
  )!;
  const dexFormsOnly = selectedSpeciesValue && selectedSpeciesValue.forms.reduce<DexItemForm[]>((acc, item) => {
    if (acc.some(it => it.form === item.form)) {
      return acc;
    }
    return [ ...acc, item ];
  }, []);

  React.useEffect(() => {
    if (selectedSaveIndex > 0 && !gameSaves[ selectedSaveIndex ]) {
      setSelectedSaveIndex(0);
      setSelectedFormIndex(0);
    }
  }, [ gameSaves, selectedSaveIndex ]);

  React.useEffect(() => {
    setSelectedFormIndex(0);
  }, [ selectedSpecies ]);

  React.useEffect(() => {
    if (selectedFormIndex > 0 && dexFormsOnly && !dexFormsOnly[ selectedFormIndex ]) {
      setSelectedFormIndex(0);
    }
  }, [ selectedFormIndex, dexFormsOnly ]);

  if (!selectedSpecies || !gameSaves.length || !dexFormsOnly) {
    // console.timeEnd("pokedex-details");
    return null;
  }

  const { genders, forms } = staticData.species[ selectedSpecies ];
  const staticForms = forms[ selectedSave.generation ];

  const selectedForm = dexFormsOnly[ selectedFormIndex ] ?? dexFormsOnly[ 0 ];
  const formObj = staticForms[ selectedFormIndex ] ?? staticForms[ 0 ];

  if (!selectedForm || !formObj) {
    return null;
  }

  const caught = selectedForm.isCaught;
  const owned = selectedForm.isOwned;
  const ownedShiny = selectedForm.isOwnedShiny;

  const speciesName = formObj.name;

  const baseStats = selectedForm.baseStats;
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
            generation={selectedSave.generation}
            form={selectedFormIndex}
            isOwned={owned}
            isShiny={ownedShiny}
            ball={caught ? staticData.itemPokeball.id : undefined}
          />
        }
        mainInfos={
          <DetailsMainInfos
            species={selectedSpecies}
            speciesName={<div style={{ display: 'inline-flex', gap: 4 }}>
              {staticForms.length <= 1 && speciesName}
              {staticForms.length > 1 && <span style={{
                display: 'inline-flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                marginTop: -3
              }}>
                <SelectNumberInput
                  data={staticForms.map((form, i) => ({
                    value: i,
                    option: form.name,
                  }))}
                  onChange={setSelectedFormIndex}
                  value={selectedFormIndex}
                  bgColor='transparent'
                  style={{
                    height: '1lh',
                    color: 'inherit',
                    borderColor: 'currentcolor',
                  }}
                />
              </span>}
            </div>}
            genders={genders}
            types={selectedForm.types}
          />
        }
        preContent={null}
        content={<>
          {/* {selectedSpeciesValue.description && (
          <div style={{ display: "flex" }}>
            <TextContainer>{description}</TextContainer>
          </div>
        )} */}

          {selectedForm.abilities.length > 0 && <TextContainer>
            <span style={{ color: theme.text.primary }}>{t('details.abilities')}</span><br />
            {selectedForm.abilities.map(ability => <div key={ability}>{
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
                  <td style={cellBaseStyle}>{t('details.stats.base')}</td>
                </tr>
              </thead>
              <tbody>
                {[ t('details.stats.hp'), t('details.stats.atk'), t('details.stats.def'), t('details.stats.spa'), t('details.stats.spd'), t('details.stats.spe') ]
                  .map((statName, i) => <tr key={statName}>
                    <td style={{ ...cellBaseStyle, textAlign: 'left' }}>{statName}</td>
                    <td style={cellBaseStyle}>{baseStats[ i ]}</td>
                  </tr>)}

                <tr>
                  <td style={{ ...cellBaseStyle, textAlign: 'left', textTransform: 'capitalize' }}>{t('total')}</td>
                  <td style={cellBaseStyle}>{totalBaseStats}</td>
                </tr>
              </tbody>
            </table>
          </TextContainer>

          {owned && (
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
