import { Card, EmptyState, Group, Skeleton, Stack } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { PackageOpenIcon } from 'lucide-react';
import React from "react";
import { withErrorCatcher } from "../../error/with-error-catcher";
import { useStaticData } from "../../hooks/use-static-data";
import { useTranslate } from '../../translate/i18n';
import { UIPokedexMainSection } from '../../ui/pokedex/main/section/ui-pokedex-main-section';
import { UIPokedexMainSectionHeader } from '../../ui/pokedex/main/section/ui-pokedex-main-section-header';
import { UIPokedexMain } from '../../ui/pokedex/main/ui-pokedex-main';
import type { PopoverTargetChildProps } from '../../ui/popover/target-open-popover';
import { UISpeciesImgSkeleton } from '../../ui/sprite-img/species-img/ui-species-img-skeleton';
import { UIGameImg } from '../../ui/sprite-img/ui-game-img';
import { DexFormItem } from "./dex-item/dex-form-item";
import { usePokedexItems } from "./hooks/use-pokedex-items";
import { PokedexItem } from "./pokedex-item";

export const PokedexList: React.FC<PopoverTargetChildProps> = withErrorCatcher("default", React.memo((popoverProps) => {
  const { t } = useTranslate();

  const itemsRef = React.useRef<HTMLElement>(null);

  const staticData = useStaticData();

  const {
    isPending,
    speciesItemsByGenerationList,
    // seenCount,
    // caughtCount,
    // ownedCount,
    // shinyCount,
    // totalCount,
  } = usePokedexItems();

  const ref = useMergedRef(
    popoverProps.ref,
    itemsRef,
  );

  React.useEffect(() => {
    if (!itemsRef.current)
      return;

    const selectedItem = itemsRef.current.querySelector<HTMLElement>('[data-dex-item][data-selected="true"]');
    if (selectedItem) {
      // apply focus is required to set scope last-node and avoid scroll inconsistencies
      // no need to scroll manually, already done by focus
      if (selectedItem.dataset.focusKey)
        setFocus(selectedItem.dataset.focusKey);
    }
  }, []);

  return <Stack h='100%' style={{ flexGrow: 1 }} {...popoverProps} ref={ref}>
    <UIPokedexMain mah='100%'>
      {!isPending && speciesItemsByGenerationList.length === 0 && <EmptyState
        size='sm'
        icon={<PackageOpenIcon />}
        title={t('dex.list.empty')}
      />}

      {isPending && <>
        <Skeleton h={24} />
        <UIPokedexMainSection>
          {new Array(54).fill(0).map((_, i) => <Skeleton key={i} w='fit-content' h='fit-content'>
            <UISpeciesImgSkeleton />
          </Skeleton>)}
        </UIPokedexMainSection>
      </>}

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
              generation={t('dex.list.title', { generation })}
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
}));
