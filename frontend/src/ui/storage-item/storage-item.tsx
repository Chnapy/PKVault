import type React from "react";
import { useStaticData } from "../../data/static-data/static-data";
import { Container } from "../container/container";
import { useDraggable } from "@dnd-kit/core";

export type StorageItemProps = {
  storageType: "main" | "save";
  pkmId: number;
  species: number;
  selected?: boolean;
  onClick?: () => void;
  warning?: boolean;
  disabled?: boolean;
  boxSlot: number;
};

export const StorageItem: React.FC<StorageItemProps> = ({
  storageType,
  pkmId,
  species,
  selected,
  onClick,
  warning,
  disabled,
  boxSlot,
}) => {
  const staticData = useStaticData();
  const pokemonDataItem = staticData.pokemon[species];

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: "storage-" + storageType + "-item-" + boxSlot,
      data: {
        storageType,
        pkmId,
      },
      disabled,
    });

  return (
    <Container
      ref={setNodeRef}
      as={onClick ? "button" : undefined}
      {...listeners}
      {...attributes}
      // borderRadius="small"
      onPointerUp={onClick}
      selected={selected}
      noDropshadow={!onClick}
      style={{
        alignSelf: "flex-start",
        padding: 0,
        order: boxSlot,
        transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      <img
        src={pokemonDataItem?.sprites.front_default ?? ""}
        alt={species + ""}
        style={{
          imageRendering: "pixelated",
          width: 96,
          height: 96,
          display: "block",
          opacity: disabled ? 0.5 : 1,
        }}
      />
    </Container>
  );
};
