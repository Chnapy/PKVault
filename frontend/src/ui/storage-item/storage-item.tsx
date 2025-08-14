import React from "react";
import { useStaticData } from "../../data/static-data/static-data";
import { Container } from "../container/container";
import { useDraggable } from "@dnd-kit/core";
import shinyIconImg from '../../assets/pkhex/img/Pokemon Sprite Overlays/rare_icon.png';
import { theme } from '../theme';
import { ItemImg } from '../item-img/item-img';

export type StorageItemProps = {
  storageType: "main" | "save";
  pkmId: string;
  species: number;
  isEgg: boolean;
  isShiny: boolean;
  isShadow: boolean;
  heldItemSprite?: number;
  selected?: boolean;
  onClick?: () => void;
  warning?: boolean;
  disabled?: boolean;
  shouldCreateVersion?: boolean;
  boxSlot: number;
};

export const StorageItem: React.FC<StorageItemProps> = ({
  storageType,
  pkmId,
  species,
  isEgg,
  isShiny,
  isShadow,
  heldItemSprite,
  selected,
  onClick,
  warning,
  disabled,
  shouldCreateVersion,
  boxSlot,
}) => {
  const staticData = useStaticData();
  const pokemonDataItem = staticData.pokemon[ species ];

  // const mainPkmQuery = useStorageGetMainPkms({
  //   query: {
  //     // enabled: type === "main",
  //   },
  // });
  // const pkm = mainPkmQuery.data?.data.find(pkm => pkm.id === pkmId);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: "storage-" + storageType + "-item-" + boxSlot,
      data: {
        storageType,
        pkmId,
      },
      disabled,
    });

  const defaultSprite = pokemonDataItem.sprites.front_default;
  const shinySprite = pokemonDataItem.sprites.front_shiny;

  const getSprite = () => {
    if (isEgg) {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png';
    }

    return isShiny ? shinySprite! : defaultSprite!
  }

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
        position: 'relative',
        alignSelf: "flex-start",
        padding: 0,
        order: boxSlot,
        transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      <img
        src={getSprite()}
        alt={species + ""}
        style={{
          imageRendering: "pixelated",
          width: 96,
          height: 96,
          display: "block",
          filter: isShadow ? 'drop-shadow(#770044 0px 0px 6px)' : undefined,
          opacity: disabled || shouldCreateVersion ? 0.5 : 1,
        }}
      />

      {heldItemSprite && <ItemImg
        spriteItem={heldItemSprite}
        style={{
          position: 'absolute',
          bottom: 4,
          left: 4,
        }}
      />}

      {isShiny && <img
        src={shinyIconImg}
        alt='shiny-icon'
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          // width: 12,
          margin: '0 -2px',
        }}
      />}

      <div style={{
        position: 'absolute',
        top: 4,
        left: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {disabled && <div style={{
          width: 20,
          height: 20,
          borderRadius: 99,
          color: theme.text.light,
          backgroundColor: theme.text.contrast,
        }}>
          -
        </div>}

        {shouldCreateVersion && !disabled && <div style={{
          width: 20,
          height: 20,
          borderRadius: 99,
          color: theme.text.light,
          backgroundColor: theme.text.primary,
        }}>
          +
        </div>}

        {warning && <div style={{
          width: 20,
          height: 20,
          borderRadius: 99,
          color: theme.text.light,
          backgroundColor: theme.bg.filter,
        }}>
          !
        </div>}
      </div>
    </Container>
  );
};
