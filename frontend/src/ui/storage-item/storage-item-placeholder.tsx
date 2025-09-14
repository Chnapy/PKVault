import type React from "react";
import { Container } from "../container/container";
import { useDroppable } from "@dnd-kit/core";

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
  const { isOver, setNodeRef } = useDroppable({
    id: "storage-" + storageType + "-placeholder-" + boxSlot,
    data: {
      storageType,
      boxId,
      boxSlot,
    },
  });

  return (
    <Container
      ref={setNodeRef}
      // as={onClick ? "button" : undefined}
      // // borderRadius="small"
      // onClick={onClick}
      selected={isOver}
      noDropshadow
      style={{
        backgroundColor: 'transparent',//theme.bg.light,
        alignSelf: "flex-start",
        padding: 0,
        width: 96,
        height: 96,
        order: boxSlot,
      }}
    />
  );
};
