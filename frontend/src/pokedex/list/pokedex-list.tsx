import React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { useStaticData } from '../../hooks/use-static-data';
import { TitledContainer } from '../../ui/container/titled-container';
import { usePokedexFilters } from "./hooks/use-pokedex-filters";
import { PokedexCount } from './pokedex-count';
import { PokedexItem, type PokedexItemProps } from "./pokedex-item";
import { useTranslate } from '../../translate/i18n';

export const PokedexList: React.FC = () => {
  // console.time("pokedex-list");
  const { t } = useTranslate();

  const staticData = useStaticData();

  const { data } = useDexGetAll();

  const { isPkmFiltered, filterSpeciesValues } = usePokedexFilters();

  if (!data) {
    return null;
  }

  const speciesRecord = data.data;

  const keys = Object.keys(speciesRecord)
    .map(Number)
    .sort((a, b) => a - b);

  const lastKey = keys[ keys.length - 1 ];

  const speciesList = new Array(lastKey).fill(0).map((_, i) => i + 1);

  const filteredSpeciesList = speciesList
    .map(species => Object.values(
      speciesRecord[ species + "" ] ?? {}
    ).filter(filterSpeciesValues))
    .filter(speciesValues => !isPkmFiltered(speciesValues));

  const itemsByGen: React.ReactNode[][] = filteredSpeciesList.reduce((acc, speciesValues) => {
    const species = speciesValues[ 0 ].species;
    const statics = staticData.species[ species ];

    const nbrForms = Math.max(...speciesValues.map(value => value.forms.length));
    const forms: PokedexItemProps[ 'forms' ] = [];
    for (let i = 0; i < nbrForms; i++) {
      const currentForms = speciesValues.map(value => value.forms[ i ]).filter(Boolean);
      forms.push({
        form: currentForms[ 0 ].form,
        generation: currentForms[ 0 ].generation,
        gender: currentForms[ 0 ].gender,
        isSeen: currentForms.some(form => form.isSeen),
        isSeenShiny: currentForms.some(form => form.isSeenShiny),
        isCaught: currentForms.some(form => form.isCaught),
        isOwned: currentForms.some(form => form.isOwned),
        isOwnedShiny: currentForms.some(form => form.isOwnedShiny),
      });
    }

    // if (new Set(forms.map(f => f.form)).size === 1) return acc;

    const genAcc = acc[ statics.generation - 1 ] ?? [];
    acc[ statics.generation - 1 ] = genAcc;
    genAcc.push(
      <PokedexItem
        key={species}
        species={species}
        forms={forms}
      />
    );

    return acc;
  }, [] as React.ReactNode[][]);

  // console.timeEnd("pokedex-list");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: 'column',
        justifyContent: "center",
        gap: 8,
        overflow: "auto",
        //   maxHeight: "100%",
        flexWrap: "wrap",
        padding: 4,
      }}
    >
      <PokedexCount
        data={filteredSpeciesList}
      />

      {itemsByGen.map((genItems, i) => <TitledContainer
        key={i}
        enableExpand
        title={
          <>
            {t('dex.list.title', { generation: i + 1 })}

            <div style={{ float: 'right' }}>
              <PokedexCount
                data={filteredSpeciesList.filter(speciesValues => staticData.species[ speciesValues[ 0 ].species ].generation === i + 1)}
              />
            </div>
          </>
        }
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
        >
          {genItems}
        </div>
      </TitledContainer>)}
    </div>
  );
};
