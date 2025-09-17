import { css } from '@emotion/css';
import type React from "react";
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { ButtonLike } from '../button/button-like';
import { theme } from '../theme';

export type StorageItemPlaceholderProps = {
  storageType: "main" | "save";
  boxId: number;
  boxSlot: number;
  pkmId?: string; // for move loading only
};

export const StorageItemPlaceholder: React.FC<StorageItemPlaceholderProps> = ({
  storageType,
  boxId,
  boxSlot,
  pkmId,
}) => {
  const moveAttributes = StorageMoveContext.useDroppable(storageType, boxId, boxSlot);

  const moveLoading = StorageMoveContext.useLoading(storageType, boxId, boxSlot, pkmId);

  return (
    <ButtonLike
      className={css(
        {
          backgroundColor: 'transparent',//theme.bg.light,
          alignSelf: "flex-start",
          padding: 0,
          width: 96,
          height: 96,
          order: boxSlot,
          boxSizing: 'content-box',
        },
        moveAttributes.onClick && {
          backgroundColor: theme.bg.light,
          '&:hover': {
            outlineWidth: 2,
          }
        }
      )}
      disabled={!moveAttributes.onClick}
      loading={moveLoading}
      onClick={moveAttributes.onClick}
      onPointerUp={moveAttributes.onPointerUp}
      // selected={isOver}
      noDropshadow
    />
  );
};
