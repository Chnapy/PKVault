import { css } from "@emotion/css";
import React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import type { EntityContext } from "../../data/sdk/model";
import { withErrorCatcher } from "../../error/with-error-catcher";
import { useStaticData } from "../../hooks/use-static-data";
import { useTranslate } from "../../translate/i18n";
import { TitledContainer } from "../../ui/container/titled-container";
import { SizingUtil } from "../../ui/util/sizing-util";
import { filterIsDefined } from "../../util/filter-is-defined";
import { usePokedexFilters } from "./hooks/use-pokedex-filters";
import { PokedexCount } from "./pokedex-count";
import { PokedexItem, type PokedexItemProps } from "./pokedex-item";
import { RenderIfVisible } from "./render-if-visible";

export const PokedexList: React.FC = withErrorCatcher("default", () => {
  const parentRef = React.useRef<HTMLDivElement>(null);
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

  const lastSpecies = keys[keys.length - 1];

  const speciesList = new Array(lastSpecies).fill(0).map((_, i) => i + 1);

  const filteredSpeciesList = speciesList
    .map((species) =>
      Object.values(speciesRecord[species + ""] ?? {}).filter(
        filterSpeciesValues,
      ),
    )
    .filter((speciesValues) => !isPkmFiltered(speciesValues));

  // TODO move data-manipulation in dex indexing data hook
  const speciesItemsByGeneration = filteredSpeciesList.reduce<
    {
      generation: number;
      speciesItems: React.ReactNode[];
    }[]
  >((acc, speciesValues) => {
    const species = speciesValues[0]!.species;
    const generation = staticData.species[species]?.generation ?? -1;

    const nbrForms = Math.max(
      ...speciesValues.map((value) => value.forms.length),
    );
    const forms: PokedexItemProps["forms"] = [];
    for (let i = 0; i < nbrForms; i++) {
      const currentForms = speciesValues
        .map((value) => value.forms[i])
        .filter(filterIsDefined);
      const maxContext = Math.max(
        ...currentForms.map((value) => value.context),
      ) as EntityContext;

      forms.push({
        id: currentForms[0]!.id,
        form: currentForms[0]!.form,
        context: maxContext,
        gender: currentForms[0]!.gender,
        isSeen: currentForms.some((form) => form.isSeen),
        isSeenShiny: currentForms.some((form) => form.isSeenShiny),
        isCaught: currentForms.some((form) => form.isCaught),
        isOwned: currentForms.some((form) => form.isOwned),
        isOwnedShiny: currentForms.some((form) => form.isOwnedShiny),
      });
    }

    const accIndex = generation - 1;

    const accCurrentItem = acc[accIndex] ?? {
      generation,
      speciesItems: [],
    };
    acc[accIndex] = accCurrentItem;

    accCurrentItem.speciesItems.push(
      <PokedexItem key={species} species={species} forms={forms} />,
    );

    return acc;
  }, []);

  const estimateSectionContentMinHeight = (nbrItems: number) => {
    const containerWidth = (parentRef.current?.clientWidth ?? 1200) - 8;
    const itemSize = SizingUtil.itemSize + 8;

    const itemsPerLine = Math.floor(containerWidth / itemSize);
    return Math.ceil(nbrItems / itemsPerLine) * itemSize;
  };

  return (
    <div
      ref={parentRef}
      className={css({
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 8,
        overflow: "auto",
        flexWrap: "wrap",
        padding: 4,
      })}
    >
      <PokedexCount data={filteredSpeciesList} />

      {speciesItemsByGeneration.map(({ generation, speciesItems }, i) => (
        <TitledContainer
          key={generation}
          enableExpand
          title={
            <>
              {t("dex.list.title", {
                generation,
                regions: staticData.generations[generation]?.regions.join(", "),
              })}

              <div className={css({ float: "right" })}>
                <PokedexCount
                  data={filteredSpeciesList.filter(
                    (speciesValues) =>
                      staticData.species[speciesValues[0]?.species ?? -1]
                        ?.generation === generation,
                  )}
                />
              </div>
            </>
          }
        >
          <RenderIfVisible
            key={generation}
            id={generation}
            minWidth={200}
            minHeight={estimateSectionContentMinHeight(speciesItems.length)}
            initialVisible={i === 0}
          >
            <div
              className={css({
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 8,
              })}
            >
              {speciesItems}
            </div>
          </RenderIfVisible>
        </TitledContainer>
      ))}
    </div>
  );
});
