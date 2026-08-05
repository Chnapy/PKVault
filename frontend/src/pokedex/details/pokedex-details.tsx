import { Grid, Group, Text } from '@mantine/core';
import React from "react";
import { Gender as GenderType } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { SpeciesImg } from '../../img/species-img';
import { Route } from "../../routes/pokedex";
import { TypeItem } from '../../storage/details/type-item/type-item';
import { useTranslate } from '../../translate/i18n';
import { UIButton } from '../../ui/form/button/ui-button';
import { UISegmentedControl } from '../../ui/form/select/ui-segmented-control';
import { UIGender } from '../../ui/icon/ui-gender';
import { UIPokedexIcons } from '../../ui/pokedex/icons/ui-pokedex-icons';
import { UIPokedexDetails } from '../../ui/pokedex/pokedex-details/ui-pokedex-details';
import { UIPokedexDetailsMain } from '../../ui/pokedex/pokedex-details/ui-pokedex-details-main';
import { UIDetailsContentStats } from '../../ui/storage/storage-details/content/stats/ui-details-content-stats';
import { UIDetailsStatsRow, type UIDetailsStatsRowProps } from '../../ui/storage/storage-details/content/stats/ui-details-stats-row';
import { UIDetailsStatsTotalRow } from '../../ui/storage/storage-details/content/stats/ui-details-stats-total-row';
import { UIDetailsContent, type UIDetailsContentProps } from '../../ui/storage/storage-details/content/ui-details-content';
import { UIDetailsContentExpanded } from '../../ui/storage/storage-details/content/ui-details-content-expanded';
import type { UIDetailsSaveData } from '../../ui/storage/storage-details/saves/ui-details-save-expanded';
import { UIDetailsSaveTab } from '../../ui/storage/storage-details/saves/ui-details-save-tab';
import { UIDetailsSaves } from '../../ui/storage/storage-details/saves/ui-details-saves';
import { PokedexDetailsMoves } from './content/pokedex-details-moves';
import { usePokedexDetailsSelect } from './hooks/use-pokedex-details-select';
import { usePokedexSelectExpanded } from './hooks/use-pokedex-select-expanded';
import { PokedexDetailsOwned } from './pokedex-details-owned';
import { getGameInfos } from './util/get-game-infos';

export const PokedexDetails: React.FC = () => {
  const { t } = useTranslate();

  const { expanded, toggleExpanded } = usePokedexSelectExpanded();

  const navigate = Route.useNavigate();

  const staticData = useStaticData();

  const selectInfos = usePokedexDetailsSelect();

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

  const speciesName = staticFormsFiltered[ 0 ]?.name ?? '';

  const isMega = !!staticData.species[ selectedSpecies ]?.forms[ selectedSave.context ]?.[ selectedStaticFormWithIndex.index ]?.isMega;

  const baseStats = selectedForm.baseStats;
  const totalBaseStats = baseStats.reduce((acc, stat) => acc + stat, 0);

  const content: UIDetailsContentProps[ 'content' ] = [
    {
      name: 'summary',
      label: t('details.summary.title'),
      content: <Grid>
        <Grid.Col span={4}>
          {t('details.abilities')}
        </Grid.Col>
        <Grid.Col span={8}>
          <Group gap='sm'>
            {selectedForm.abilities.length > 0
              ? selectedForm.abilities.map(ability => <Text key={ability} w='100%'>
                {staticData.abilities[ ability ]?.name} {ability === selectedForm.abilityHidden && `(${t('details.ability.hidden')})`}
              </Text>)
              : '-'}
          </Group>
        </Grid.Col>
      </Grid>,
    },
    selectedForm.isOwned && {
      name: 'owned',
      label: <><UIPokedexIcons.Owned size='xs' /> {t('details.owned.title')}</>,
      content: <PokedexDetailsOwned saveId={selectedSpeciesValue.saveId || null} species={selectedSpeciesValue.species} />,
    },
    {
      name: 'stats',
      label: t('details.stats.title'),
      content: <UIDetailsContentStats>
        {([ 'hp', 'atk', 'def', 'spa', 'spd', 'spe' ] satisfies UIDetailsStatsRowProps[ 'stat' ][])
          .map((stat, i) => <UIDetailsStatsRow key={stat} stat={stat} value={baseStats[ i ]!} level={50} />)}
        <UIDetailsStatsTotalRow total={totalBaseStats} level={50} />
      </UIDetailsContentStats>,
    },
    {
      name: 'moves',
      label: t('details.moves.title'),
      content: <PokedexDetailsMoves
        context={selectedSave.context}
        generation={selectedSave.generation}
        species={selectedSpecies}
        formIndex={selectedStaticFormWithIndex.index}
      />,
    },
    {
      name: 'evolutions',
      label: t('details.evolutions.title'),
      content: 'WIP',
    },
    {
      name: 'locations',
      label: t('details.locations.title'),
      content: 'WIP',
    },
    {
      name: 'misc',
      label: t('details.misc.title'),
      content: 'WIP',
    },
  ].filter(v => typeof v === 'object');

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
      autoScrollValue={`${selectedSpecies}-${selectedSave.id}`}
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
      speciesName={speciesName}
      gender={selectedForm.gender}
      isShiny={selectedForm.isSeenShiny}
      isAlpha={selectedForm.isSeenAlpha}
      isMega={isMega}
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
        controlLabel={t('details.form.change')}
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
              controlLabel={t('details.form.change')}
              size='xs'
              onClick={() => setSelectedFormId(form.id)}
              disabled={selectedForm.id === form.id}
            >
              <Group wrap='nowrap' gap='sm'>
                <UIGender gender={form.gender} />
                {form.isCaught && <UIPokedexIcons.Caught size='xs' />}
                {form.isOwned && <UIPokedexIcons.Owned size='xs' />}
                {form.isSeenShiny && <UIPokedexIcons.Shiny size='xs' />}
                {form.isSeenAlpha && <UIPokedexIcons.Alpha size='xs' />}
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
};
