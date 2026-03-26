import { css, cx } from '@emotion/css';
import React from "react";
import { Gender as GenderType } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from "../../routes/pokedex";
import { useTranslate } from '../../translate/i18n';
import { BallImg } from '../../ui/details-card/ball-img';
import { DetailsCardContainer, type DetailsExpandedState } from '../../ui/details-card/details-card-container';
import { DetailsMainImg } from '../../ui/details-card/details-main-img';
import { DetailsMainInfos } from '../../ui/details-card/details-main-infos';
import { DetailsTab } from '../../ui/details-card/details-tab';
import { DetailsTitle } from '../../ui/details-card/details-title';
import { Gender } from '../../ui/gender/gender';
import { AlphaIcon } from '../../ui/icon/alpha-icon';
import { Icon } from '../../ui/icon/icon';
import { ShinyIcon } from '../../ui/icon/shiny-icon';
import { SelectNumberInput, SelectStringInput } from '../../ui/input/select-input';
import { TextContainer } from '../../ui/text-container/text-container';
import { theme } from '../../ui/theme';
import { usePokedexDetailsSelect } from './hooks/use-pokedex-details-select';
import { PokedexDetailsOwned } from './pokedex-details-owned';
import { getGameInfos } from './util/get-game-infos';

export const PokedexDetails: React.FC = () => {
  const { t } = useTranslate();

  const selectExpanded = Route.useSearch({ select: search => search.selectExpanded ?? 'none' });

  const navigate = Route.useNavigate();

  const staticData = useStaticData();

  const selectInfos = usePokedexDetailsSelect();

  const setSelectExpanded = (state: DetailsExpandedState) => {
    navigate({
      search: (search) => ({
        ...search,
        selectExpanded: state,
      }),
    });
  };

  if (!selectInfos) {
    return null;
  }

  const {
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
  } = selectInfos;

  const caught = selectedForm.isCaught;
  const owned = selectedForm.isOwned;

  const speciesName = selectedStaticFormWithIndex.name;

  const baseStats = selectedForm.baseStats;
  const totalBaseStats = baseStats.reduce((acc, stat) => acc + stat, 0);
  const cellBaseClassName = css({ padding: 0, textAlign: 'center' });

  return (
    <DetailsCardContainer
      tabs={<>
        {gameSaves.map(save => (
          <DetailsTab
            key={save.id}
            contextVersion={save.version}
            otName={save.trainerName}
            onClick={() => setSelectedSaveId(save.id)}
            disabled={selectedSave.id === save.id}
          />
        ))}
      </>}
      bgColor={getGameInfos(selectedSave.version).color}
      title={<DetailsTitle
        context={selectedSave.context}
        contextVersion={selectedSave.version}
        showVersionName
      />}
      mainImg={
        <DetailsMainImg
          species={selectedSpecies}
          context={selectedForm.context}
          form={selectedForm.form}
          gender={selectedForm.gender}
          isFemale={selectedForm.gender === GenderType.Female}
          isOwned={owned}
          isShiny={selectedForm.isSeenShiny}
          isAlpha={selectedForm.isSeenAlpha}
          ball={caught ? staticData.itemPokeball.id : undefined}
        />
      }
      mainImgSub={
        <SelectStringInput
          anchor='bottom end'
          onChange={setSelectedFormId}
          value={selectedForm.id}
          disabled={selectedFormIndexForms.length < 2}
          data={selectedFormIndexForms.map(form => ({
            value: form.id,
            disabled: form.id === selectedForm.id,
            option: <div className={css({
              width: '100%',
              minWidth: 70,
              display: 'flex',
              // justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 4,
              fontSize: '1rem',
              padding: 2,
            })}>
              {form.isCaught && <BallImg size={16} />}

              {form.isOwned && <Icon name='folder' solid />}

              <Gender gender={form.gender} />

              {form.isSeenAlpha && <AlphaIcon
                className={css({
                  height: '1em',
                })}
              />}

              {form.isOwnedShiny && <ShinyIcon
                className={css({
                  height: '1em',
                })}
              />}
            </div>,
          }))}
          bgColor='transparent'
          className={css({
            width: '100%',

            color: theme.text.default,
            borderColor: 'currentcolor',
          })}
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
                  disabled: !selectedSpeciesValue.forms.find(form => form.form === staticForm.index)?.isSeen,
                }))}
                onChange={selectedByFormIndex}
                value={selectedForm.form}
                bgColor='transparent'
                className={css({
                  height: '1lh',
                  color: 'inherit',
                  borderColor: 'currentcolor',
                })}
              />
            </span>}
          </div>}
          version={selectedSave.version ?? 0}
          types={selectedForm.types}
        />
      }
      preContent={null}
      content={<>
        {selectedForm.abilities.length > 0 && <TextContainer stick>
          <span className={css({ color: theme.text.primary })}>{t('details.abilities')}</span><br />
          {selectedForm.abilities.map(ability => <div key={ability}>{
            staticData.abilities[ ability ]?.name
          }</div>)}
        </TextContainer>}

        <TextContainer stick>
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
      expanded={selectExpanded}
      setExpanded={setSelectExpanded}
    />
  );
};
