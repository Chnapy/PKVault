import { css, cx } from '@emotion/css';
import type React from "react";
import { withErrorCatcher } from '../../error/with-error-catcher';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { ButtonWithDisabledPopover } from '../button/button-with-disabled-popover';
import { theme } from '../theme';
import { SizingUtil } from '../util/sizing-util';

export type StorageItemPlaceholderProps = {
  saveId?: number;
  boxId: number;
  boxSlot: number;
  pkmId?: string; // for move drop/loading only
};

export const StorageItemPlaceholder: React.FC<StorageItemPlaceholderProps> = withErrorCatcher('item', ({
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
          width: SizingUtil.itemSize,
          height: SizingUtil.itemSize,
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
      disabled={!moveDroppable.onClick}
      loading={moveLoading}
      onClick={moveDroppable.onClick}
      onPointerUp={moveDroppable.onPointerUp}
      noDropshadow
      anchor='top'
      showHelp={!!moveDroppable.helpText}
      helpTitle={moveDroppable.helpText}
    />
  );
});
