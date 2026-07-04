import { Group } from '@mantine/core';
import { FolderIcon } from 'lucide-react';
import React from "react";
import { Gender as GenderType } from '../../data/sdk/model';
import { Route } from "../../routes/pokedex";
import { UIButton } from '../../ui-new/form/button/ui-button';
import { UISegmentedControl } from '../../ui-new/form/select/ui-segmented-control';
import { UIAlphaIcon } from '../../ui-new/icon/ui-alpha-icon';
import { UIBallIcon } from '../../ui-new/icon/ui-ball-icon';
import { UIGender } from '../../ui-new/icon/ui-gender';
import { UIShinyIcon } from '../../ui-new/icon/ui-shiny-icon';
import { UIPokedexDetails } from '../../ui-new/pokedex/pokedex-details/ui-pokedex-details';
import { UIPokedexDetailsMain } from '../../ui-new/pokedex/pokedex-details/ui-pokedex-details-main';
import { UIDetailsContentStats } from '../../ui-new/storage/storage-details/content/stats/ui-details-content-stats';
import { UIDetailsStatsRow, type UIDetailsStatsRowProps } from '../../ui-new/storage/storage-details/content/stats/ui-details-stats-row';
import { UIDetailsContent, type UIDetailsContentProps } from '../../ui-new/storage/storage-details/content/ui-details-content';
import { UIDetailsContentExpanded } from '../../ui-new/storage/storage-details/content/ui-details-content-expanded';
import type { UIDetailsSaveData } from '../../ui-new/storage/storage-details/saves/ui-details-save-expanded';
import { UIDetailsSaveTab } from '../../ui-new/storage/storage-details/saves/ui-details-save-tab';
import { UIDetailsSaves } from '../../ui-new/storage/storage-details/saves/ui-details-saves';
import { SpeciesImg } from '../../ui/img/species-img';
import { TypeItem } from '../../ui/type-item/type-item';
import { usePokedexDetailsSelect } from './hooks/use-pokedex-details-select';
import { usePokedexSelectExpanded } from './hooks/use-pokedex-select-expanded';
import { getGameInfos } from './util/get-game-infos';

export const PokedexDetails: React.FC = () => {
  // const { t } = useTranslate();

  const { expanded, toggleExpanded } = usePokedexSelectExpanded();

  const navigate = Route.useNavigate();

  // const staticData = useStaticData();

  const selectInfos = usePokedexDetailsSelect();

  // const setSelectExpanded = (state: DetailsExpandedState) => {
  //   navigate({
  //     search: (search) => ({
  //       ...search,
  //       selectExpanded: state,
  //     }),
  //   });
  // };

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

  const baseStats = selectedForm.baseStats;
  // const totalBaseStats = baseStats.reduce((acc, stat) => acc + stat, 0);

  const content: UIDetailsContentProps[ 'content' ] = [
    {
      name: 'stats',
      label: 'Stats',
      content: <UIDetailsContentStats>
        {([ 'hp', 'atk', 'def', 'spa', 'spd', 'spe' ] satisfies UIDetailsStatsRowProps[ 'stat' ][])
          .map((stat, i) => <UIDetailsStatsRow key={stat} stat={stat} value={baseStats[ i ]!} />)}
      </UIDetailsContentStats>,
    },
    {
      name: 'moves',
      label: 'Moves',
      content: 'WIP',
    },
    {
      name: 'evolutions',
      label: 'Evolutions',
      content: 'WIP',
    },
    {
      name: 'locations',
      label: 'Locations',
      content: 'WIP',
    },
    {
      name: 'misc',
      label: 'Misc',
      content: 'WIP',
    },
  ];

  return <UIPokedexDetails
    expanded={expanded}
    onExpand={toggleExpanded}
    header={closeBtn => <UIDetailsSaves
      value={selectedSave.id.toString()}
      data={gameSaves.map((save): UIDetailsSaveData => ({
        id: save.id.toString(),
        imgSrc: getGameInfos(save.displayedVersion).img,
        label: save.trainerName,
      }))}
      onSelect={(id) => setSelectedSaveId(+id)}
      actions={closeBtn}
      renderTab={({ item, selected }) => {
        const save = gameSaves.find(s => s.id === +item.id);
        if (!save)
          return null;

        return <UIDetailsSaveTab
          key={item.id}
          id={item.id}
          version={save.displayedVersion}
          color={getGameInfos(save.displayedVersion).color}
          selected={selected}
          label={item.label}
        />;
      }}
    />}
    main={<UIPokedexDetailsMain
      species={selectedSpecies}
      speciesName={staticFormsFiltered[ 0 ]?.name ?? ''}
      form={selectedStaticFormWithIndex.name}
      gender={selectedForm.gender}
      isShiny={selectedForm.isSeenShiny}
      isAlpha={selectedForm.isSeenAlpha}
      isSeen={selectedForm.isSeen}
      isCaught={selectedForm.isCaught}
      isOwned={selectedForm.isOwned}
      types={selectedForm.types.map(type => <TypeItem key={type} type={type} />)}
      children={<SpeciesImg
        species={selectedSpecies}
        context={selectedForm.context}
        form={selectedForm.form}
        isFemale={selectedForm.gender === GenderType.Female}
        isShiny={selectedForm.isSeenShiny}
      />}
    />}
    items={<>
      {staticFormsFiltered.length > 1 && <UISegmentedControl
        name='forms'
        controlLabel='Change form'
        data={staticFormsFiltered.map(staticForm => ({
          value: staticForm.index.toString(),
          label: staticForm.name,
          disabled: !selectedSpeciesValue.forms.find(form => form.form === staticForm.index)?.isSeen,
        }))}
        value={selectedForm.form.toString()}
        onChange={index => selectedByFormIndex(+index)}
        focusOnMount
        wrap
        gamepadControls={[ 'DPadLeft', 'DPadRight' ]}
      // bdrs={0}
      />}

      <Group p='md'>
        {selectedFormIndexForms
          .filter(form => form.form === selectedForm.form)
          .map(form => {
            return <UIButton
              key={form.id}
              name={form.id}
              controlLabel='Change form'
              size='xs'
              onClick={() => setSelectedFormId(form.id)}
              disabled={selectedForm.id === form.id}
            >
              <Group wrap='nowrap' gap='sm'>
                <UIGender gender={form.gender} />
                {form.isCaught && <UIBallIcon />}
                {form.isOwned && <FolderIcon />}
                {form.isSeenShiny && <UIShinyIcon />}
                {form.isSeenAlpha && <UIAlphaIcon />}
              </Group>
            </UIButton>;
          })}
      </Group>
    </>}
    content={expanded
      ? <UIDetailsContentExpanded content={content} />
      : <UIDetailsContent content={content} />}
    onClose={() => navigate({
      search: {
        selected: undefined,
      }
    })}
  />;

  // return (
  //   <DetailsCardContainer
  //     content={<>
  //       {selectedForm.abilities.length > 0 && <TextContainer stick>
  //         <span className={css({ color: theme.text.primary })}>{t('details.abilities')}</span><br />
  //         {selectedForm.abilities.map(ability => <div key={ability}>{
  //           staticData.abilities[ ability ]?.name
  //         }</div>)}
  //       </TextContainer>}

  //       {owned && (
  //         <PokedexDetailsOwned saveId={selectedSpeciesValue.saveId} species={selectedSpeciesValue.species} />
  //       )}
  //     </>}
  //   />
  // );
};
