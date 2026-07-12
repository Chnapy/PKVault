import { Card, Group, Stack } from '@mantine/core';
import React from "react";
import { withErrorCatcher } from "../../error/with-error-catcher";
import { useStaticData } from "../../hooks/use-static-data";
import { UIPokedexMainSection } from '../../ui-new/pokedex/main/section/ui-pokedex-main-section';
import { UIPokedexMainSectionHeader } from '../../ui-new/pokedex/main/section/ui-pokedex-main-section-header';
import { UIPokedexMain } from '../../ui-new/pokedex/main/ui-pokedex-main';
import type { PopoverTargetChildProps } from '../../ui-new/popover/target-open-popover';
import { UIGameImg } from '../../ui-new/sprite-img/ui-game-img';
import { DexFormItem } from "../../ui/dex-item/dex-form-item";
import { usePokedexItems } from "./hooks/use-pokedex-items";
import { PokedexItem } from "./pokedex-item";

export const PokedexList: React.FC<PopoverTargetChildProps> = withErrorCatcher("default", (popoverProps) => {
  // const { t } = useTranslate();

  const staticData = useStaticData();

  const {
    // isLoading,
    speciesItemsByGenerationList,
    // seenCount,
    // caughtCount,
    // ownedCount,
    // shinyCount,
    // totalCount,
  } = usePokedexItems();

  return <Stack h='100%' style={{ flexGrow: 1 }} {...popoverProps}>
    <UIPokedexMain mah='100%'>
      {speciesItemsByGenerationList.map(({
        generation,
        versionsForImgs,
        speciesInfos,
        seenCount,
        caughtCount,
        ownedCount,
        shinyCount,
        totalCount,
        itemsCount,
      }, i) => [
          <Card.Section key={i} inheritPadding withBorder>
            <UIPokedexMainSectionHeader
              generation={`Generation ${generation}`}
              regions={staticData.generations[ generation ]?.regions ?? []}
              games={versionsForImgs.map((versions, i) => <Group key={i} gap='xs'>
                {versions.map(version => <UIGameImg
                  key={version}
                  version={version}
                  size='1lh'
                />)}
              </Group>)}
              seenCount={seenCount}
              caughtCount={caughtCount}
              ownedCount={ownedCount}
              shinyCount={shinyCount}
              totalCount={totalCount}
            />
          </Card.Section>,
          <Card.Section key={i + 100} inheritPadding withBorder>
            <UIPokedexMainSection>
              {speciesInfos.map(({ species, speciesName, isSeen, itemsToRender }, i) => (
                <PokedexItem
                  key={species}
                  species={species}
                  speciesName={speciesName}
                  isSeen={isSeen}
                >
                  {itemsToRender.map((item) => (
                    <DexFormItem key={item.id} {...item} />
                  ))}
                </PokedexItem>
              ))}
            </UIPokedexMainSection>
          </Card.Section>,
        ])}
    </UIPokedexMain>
  </Stack>;
});
