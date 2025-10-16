import { css, cx } from '@emotion/css';
import type React from "react";
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { theme } from '../theme';
import { ButtonWithDisabledPopover } from '../button/button-with-disabled-popover';

export type StorageItemPlaceholderProps = {
  saveId?: number;
  boxId: number;
  boxSlot: number;
  pkmId?: string; // for move drop/loading only
};

export const StorageItemPlaceholder: React.FC<StorageItemPlaceholderProps> = ({
  saveId,
  boxId,
  boxSlot,
  pkmId,
}) => {
  const moveDroppable = StorageMoveContext.useDroppable(saveId, boxId, boxSlot, pkmId);

  const moveLoading = StorageMoveContext.useLoading(saveId, boxId, boxSlot, pkmId);

  return (
    <ButtonWithDisabledPopover
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
          borderColor: theme.text.default,
          '&:hover': {
            outlineWidth: 2,
          }
        })
      )}
      rootStyle={{
        order: boxSlot,
      }}
      disabled={!moveDroppable.onClick}
      loading={moveLoading}
      onClick={moveDroppable.onClick}
      onPointerUp={moveDroppable.onPointerUp}
      // selected={isOver}
      noDropshadow
      anchor='top'
      showHelp={!!moveDroppable.helpText}
      helpTitle={moveDroppable.helpText}
    />
  );
};
