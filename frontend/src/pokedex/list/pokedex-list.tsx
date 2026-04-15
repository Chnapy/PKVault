import { css } from "@emotion/css";
import React from "react";
import { withErrorCatcher } from "../../error/with-error-catcher";
import { useStaticData } from "../../hooks/use-static-data";
import { useTranslate } from "../../translate/i18n";
import { TitledContainer } from "../../ui/container/titled-container";
import { DexFormItem } from "../../ui/dex-item/dex-form-item";
import { Icon } from '../../ui/icon/icon';
import { GameImg } from '../../ui/img/game-img';
import { RenderIfVisible } from "../../ui/render-if-visible/render-if-visible";
import { SizingUtil } from "../../ui/util/sizing-util";
import { usePokedexItems } from "./hooks/use-pokedex-items";
import { PokedexCount } from "./pokedex-count";
import { PokedexItem } from "./pokedex-item";

export const PokedexList: React.FC = withErrorCatcher("default", () => {
  const { t } = useTranslate();

  const staticData = useStaticData();

  const {
    isLoading,
    speciesItemsByGenerationList,
    seenCount,
    caughtCount,
    ownedCount,
    shinyCount,
    totalCount,
  } = usePokedexItems();

  const estimateSectionContentMinHeight = (nbrItems: number) => {
    const containerWidth = document.body.clientWidth - 60;
    const itemSize = SizingUtil.itemSize + 8;

    const itemsPerLine = Math.floor(containerWidth / itemSize);
    const nbrLines = Math.ceil(nbrItems / itemsPerLine);

    return nbrLines * itemSize;
  };

  return (
    <div
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
      <PokedexCount
        seenCount={seenCount}
        caughtCount={caughtCount}
        ownedCount={ownedCount}
        shinyCount={shinyCount}
        totalCount={totalCount}
      />

      {isLoading && <Icon
        name='spinner-third'
        className={css({
          alignSelf: 'center',
          animation: 'spin 1s linear infinite',

          '@keyframes spin': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
        })}
      />}

      {speciesItemsByGenerationList.map(
        (
          {
            generation,
            versionsForImgs,
            speciesInfos,
            seenCount,
            caughtCount,
            ownedCount,
            shinyCount,
            totalCount,
            itemsCount,
          },
          i,
        ) => (
          <TitledContainer
            key={generation}
            enableExpand
            title={
              <>
                {t("dex.list.title", {
                  generation,
                  regions:
                    staticData.generations[ generation ]?.regions.join(", "),
                })}

                <div
                  style={{
                    display: 'inline-flex',
                    gap: 8,
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    marginLeft: 8,
                    marginRight: 8,
                  }}
                >
                  {versionsForImgs
                    .map((versions, i) => <div
                      key={i}
                      className={css({
                        display: 'inline-flex',
                        gap: 4,
                      })}
                    >
                      {versions.map(version => <GameImg
                        key={version}
                        version={version}
                        size={20}
                        borderWidth={1}
                      />)}
                    </div>)}
                </div>

                <div className={css({ float: "right" })}>
                  <PokedexCount
                    seenCount={seenCount}
                    caughtCount={caughtCount}
                    ownedCount={ownedCount}
                    shinyCount={shinyCount}
                    totalCount={totalCount}
                  />
                </div>
              </>
            }
          >
            <RenderIfVisible
              id={generation}
              minWidth={200}
              minHeight={estimateSectionContentMinHeight(itemsCount)}
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
                {speciesInfos.map((speciesInfo) => (
                  <PokedexItem
                    key={speciesInfo.species}
                    species={speciesInfo.species}
                    isSeen={speciesInfo.isSeen}
                  >
                    {speciesInfo.itemsToRender.map((item) => (
                      <DexFormItem key={item.id} {...item} />
                    ))}
                  </PokedexItem>
                ))}
              </div>
            </RenderIfVisible>
          </TitledContainer>
        ),
      )}
    </div>
  );
});
