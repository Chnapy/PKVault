import React from "react";
import { Container } from "../container/container";
import { useDraggable } from "@dnd-kit/core";
import shinyIconImg from '../../assets/pkhex/img/Pokemon Sprite Overlays/rare_icon.png?url';
import { theme } from '../theme';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { StorageItemActions } from './storage-item-actions';

export type StorageItemProps = {
  storageType: "main" | "save";
  pkmId: string;
  species: number;
  isEgg: boolean;
  isShiny: boolean;
  isShadow: boolean;
  sprite: string;
  heldItemSprite?: string;
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
  sprite,
  heldItemSprite,
  selected,
  onClick,
  warning,
  disabled,
  shouldCreateVersion,
  boxSlot,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: "storage-" + storageType + "-item-" + boxSlot,
      data: {
        storageType,
        pkmId,
      },
      // disabled,
    });

  return (
    <Popover
      style={{
        position: 'relative',
        alignSelf: "flex-start",
        order: boxSlot,
        transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      <PopoverButton
        as={Container}
        componentDescriptor='button'
        ref={setNodeRef}
        // as={onClick ? "button" : undefined}
        {...listeners}
        {...attributes}
        // borderRadius="small"
        onPointerUp={onClick}
        selected={selected}
        noDropshadow={!onClick}
        style={{
          backgroundColor: theme.bg.light,
          position: 'relative',
          alignSelf: "flex-start",
          padding: 0,
        }}
      >
        <img
          src={sprite}
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

        {heldItemSprite && <img
          src={heldItemSprite}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
          }}
        />}

        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            textAlign: 'center',
          }}
        >
          {isShiny && <img
            src={shinyIconImg}
            alt='shiny-icon'
            style={{
              margin: '0 -2px',
            }}
          />}

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
      </PopoverButton>

      {selected && <PopoverPanel static anchor="right start">
        <StorageItemActions />
      </PopoverPanel>}
    </Popover>
  );
};
