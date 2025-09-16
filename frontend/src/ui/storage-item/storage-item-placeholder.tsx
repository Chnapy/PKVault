import { css } from '@emotion/css';
import type React from "react";
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { Container } from "../container/container";
import { theme } from '../theme';

export type StorageItemPlaceholderProps = {
  storageType: "main" | "save";
  boxId: number;
  boxSlot: number;
};

export const StorageItemPlaceholder: React.FC<StorageItemPlaceholderProps> = ({
  storageType,
  boxId,
  boxSlot,
}) => {
  const moveAttributes = StorageMoveContext.useDroppable(storageType, boxId, boxSlot);

  return (
    <Container
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
      // as={onClick ? "button" : undefined}
      // // borderRadius="small"
      onClick={moveAttributes.onClick}
      onPointerUp={moveAttributes.onPointerUp}
      // selected={isOver}
      noDropshadow
    />
  );
};
