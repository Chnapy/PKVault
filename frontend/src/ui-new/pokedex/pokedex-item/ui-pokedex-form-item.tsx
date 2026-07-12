import { Box, Group, Stack } from '@mantine/core';
import React from "react";
import type { Gender } from '../../../data/sdk/model';
import { UIGender } from '../../icon/ui-gender';
import { UIPokedexIcons } from '../icons/ui-pokedex-icons';

type UIPokedexFormItemProps = {
  genders: Gender[];
  isSeen?: boolean;
  isSeenAlpha?: boolean;
  isCaught?: boolean;
  isOwned?: boolean;
  isOwnedShiny?: boolean;
  children: React.ReactNode;
};

export const UIPokedexFormItem: React.FC<UIPokedexFormItemProps> = ({
  genders,
  isSeen,
  isSeenAlpha,
  isCaught,
  isOwned,
  isOwnedShiny,
  children
}) => {

  return <Box pos='relative'>
    <Box
      style={{
        filter: isSeen
          ? undefined
          : 'brightness(0) opacity(0.4)',
      }}
    >
      {children}
    </Box>

    <Group pos='absolute' top={0} right={0} gap='xs' p='sm'>
      {isOwned && <UIPokedexIcons.Owned size='sm' />}

      {isCaught && <UIPokedexIcons.Caught size='sm' />}
    </Group>
    <Stack pos='absolute' bottom={0} right={0} align='flex-end' gap='sm' p='sm'>
      {isSeenAlpha && <UIPokedexIcons.Alpha size='sm' />}

      {isOwnedShiny && <UIPokedexIcons.Shiny size='sm' />}

      <Group gap='xs'>
        {genders.map(gender => <UIGender key={gender} gender={gender} size='small' />)}
      </Group>
    </Stack>
  </Box>;
};
