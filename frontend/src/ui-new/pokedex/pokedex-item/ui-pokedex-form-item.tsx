import { Box, Group, Stack, ThemeIcon } from '@mantine/core';
import { FolderIcon } from 'lucide-react';
import React from "react";
import type { Gender } from '../../../data/sdk/model';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIBallIcon } from '../../icon/ui-ball-icon';
import { UIGender } from '../../icon/ui-gender';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';

type UIPokedexFormItemProps = {
  genders: Gender[];
  isSeen?: boolean;
  isSeenAlpha?: boolean;
  isCaught?: boolean;
  isOwned?: boolean;
  isOwnedShiny?: boolean;
  children: React.ReactNode;
};

const wrapIcon = (icon: React.ReactNode) => <ThemeIcon variant='default' size='sm' opacity={0.75}>
  {icon}
</ThemeIcon>;

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
      {isOwned && wrapIcon(<FolderIcon />)}

      {isCaught && wrapIcon(<UIBallIcon />)}
    </Group>
    <Stack pos='absolute' bottom={0} right={0} gap='sm' p='sm'>
      {isSeenAlpha && wrapIcon(<UIAlphaIcon />)}

      {isOwnedShiny && wrapIcon(<UIShinyIcon />)}

      <Group gap='xs'>
        {genders.map(gender => <UIGender key={gender} gender={gender} size='small' />)}
      </Group>
    </Stack>
  </Box>;
};
