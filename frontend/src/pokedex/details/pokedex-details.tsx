import { css, cx } from '@emotion/css';
import React from "react";
import { Gender as GenderType } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from "../../routes/pokedex";
import { useTranslate } from '../../translate/i18n';
import { ButtonLike } from '../../ui/button/button-like';
import { DetailsCardContainer } from '../../ui/details-card/details-card-container';
import { DetailsMainImg } from '../../ui/details-card/details-main-img';
import { DetailsMainInfos } from '../../ui/details-card/details-main-infos';
import { DetailsTab } from '../../ui/details-card/details-tab';
import { DetailsTitle } from '../../ui/details-card/details-title';
import { Gender } from '../../ui/gender/gender';
import { ShinyIcon } from '../../ui/icon/shiny-icon';
import { SelectNumberInput } from '../../ui/input/select-input';
import { TextContainer } from '../../ui/text-container/text-container';
import { theme } from '../../ui/theme';
import { usePokedexDetailsSelect } from './hooks/use-pokedex-details-select';
import { PokedexDetailsOwned } from './pokedex-details-owned';
import { getGameInfos } from './util/get-game-infos';

export const PokedexDetails: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const staticData = useStaticData();

  const selectInfos = usePokedexDetailsSelect();

  if (!selectInfos) {
    return null;
  }

  const {
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
  } = selectInfos;

  const selectedFormSimilars = selectedSpeciesValue.forms.filter(form => form.form === selectedFormIndex);
  const selectedFormGenders = selectedFormSimilars.map(form => form.gender);
  const hasMultipleSeenGenders = selectedFormSimilars.filter(form => form.isSeen).length > 1;

  const caught = selectedForm.isCaught;
  const owned = selectedShiny ? selectedForm.isOwnedShiny : selectedForm.isOwned;

  const speciesName = selectedStaticFormWithIndex.name;

  const baseStats = selectedForm.baseStats;
  const totalBaseStats = baseStats.reduce((acc, stat) => acc + stat, 0);
  const cellBaseClassName = css({ padding: 0, textAlign: 'center' });

  return (
    <div>
      <div
        className={css({
          display: 'flex',
          gap: '0 4px',
          padding: '0 8px',
          flexWrap: 'wrap-reverse',
        })}
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
          generation={selectedForm.generation}
          showVersionName
        />}
        mainImg={
          <DetailsMainImg
            species={selectedSpecies}
            context={selectedForm.context}
            form={selectedFormIndex}
            isFemale={selectedGender === GenderType.Female}
            isOwned={owned}
            isShiny={selectedShiny}
            ball={caught ? staticData.itemPokeball.id : undefined}
            shinyPart={selectedForm.generation > 1 && <ButtonLike
              onClick={() => setSelectedShiny(!selectedShiny)}
              disabled={!selectedForm.isOwnedShiny}
            >
              <ShinyIcon
                className={css({
                  width: '1lh',
                  height: '1lh',
                  filter: selectedShiny ? undefined : 'brightness(0) opacity(0.5)',
                })}
              />
            </ButtonLike>}
            genderPart={selectedFormGenders.length > 1
              ? <ButtonLike
                onClick={() => setSelectedGender((selectedGender + 1) % selectedFormGenders.length as GenderType)}
                disabled={!hasMultipleSeenGenders}
              >
                <Gender gender={selectedGender} className={css({ width: '1lh' })} />
              </ButtonLike>
              : <Gender gender={selectedGender} />
            }
          />
        }
        mainInfos={
          <DetailsMainInfos
            species={selectedSpecies}
            speciesName={<div className={css({ display: 'inline-flex', gap: 4 })}>
              {staticFormsFiltered.length <= 1 && speciesName}
              {staticFormsFiltered.length > 1 && <span className={css({
                display: 'inline-flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                marginTop: -3
              })}>
                <SelectNumberInput
                  data={staticFormsFiltered.map(staticForm => ({
                    value: staticForm.index,
                    option: staticForm.name,
                    disabled: !selectedSpeciesValue.forms.some(form => form.form === staticForm.index && form.isSeen),
                  }))}
                  onChange={setSelectedFormIndex}
                  value={selectedFormIndex}
                  bgColor='transparent'
                  className={css({
                    height: '1lh',
                    color: 'inherit',
                    borderColor: 'currentcolor',
                  })}
                />
              </span>}
            </div>}
            types={selectedForm.types}
          />
        }
        preContent={null}
        content={<>
          {selectedForm.abilities.length > 0 && <TextContainer>
            <span className={css({ color: theme.text.primary })}>{t('details.abilities')}</span><br />
            {selectedForm.abilities.map(ability => <div key={ability}>{
              staticData.abilities[ ability ]?.name
            }</div>)}
          </TextContainer>}

          <TextContainer>
            <table
              className={css({
                borderSpacing: '8px 0'
              })}
            >
              <thead>
                <tr>
                  <td className={cellBaseClassName}></td>
                  <td className={cellBaseClassName}>{t('details.stats.base')}</td>
                </tr>
              </thead>
              <tbody>
                {[ t('details.stats.hp'), t('details.stats.atk'), t('details.stats.def'), t('details.stats.spa'), t('details.stats.spd'), t('details.stats.spe') ]
                  .map((statName, i) => <tr key={statName}>
                    <td className={cx(cellBaseClassName, css({ textAlign: 'left' }))}>{statName}</td>
                    <td className={cellBaseClassName}>{baseStats[ i ]}</td>
                  </tr>)}

                <tr>
                  <td className={cx(cellBaseClassName, css({ textAlign: 'left', textTransform: 'capitalize' }))}>{t('total')}</td>
                  <td className={cellBaseClassName}>{totalBaseStats}</td>
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
