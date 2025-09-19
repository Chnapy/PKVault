import { css, cx } from '@emotion/css';
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
  const moveDroppable = StorageMoveContext.useDroppable(storageType, boxId, boxSlot, pkmId);

  const moveLoading = StorageMoveContext.useLoading(storageType, boxId, boxSlot, pkmId);

  return (
    <ButtonLike
      className={cx(
        css({
          backgroundColor: 'transparent',//theme.bg.light,
          alignSelf: "flex-start",
          padding: 0,
          width: 96,
          height: 96,
          boxSizing: 'content-box',
        }),
        moveDroppable.onClick && css({
          backgroundColor: theme.bg.light,
          '&:hover': {
            outlineWidth: 2,
          }
        })
      )}
      style={{
        order: boxSlot,
      }}
      disabled={!moveDroppable.onClick}
      loading={moveLoading}
      onClick={moveDroppable.onClick}
      onPointerUp={moveDroppable.onPointerUp}
      // selected={isOver}
      noDropshadow
    />
  );
};
