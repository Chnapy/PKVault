import { css, cx } from '@emotion/css';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import React from "react";
import { useStaticData } from '../../hooks/use-static-data';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { ButtonLike } from '../button/button-like';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { theme } from '../theme';
import { StorageItemMainActions } from './storage-item-main-actions';
import { StorageItemMainActionsContainer } from './storage-item-main-actions-container';
import { StorageItemPlaceholder } from './storage-item-placeholder';
import { StorageItemSaveActions } from './storage-item-save-actions';
import { StorageItemSaveActionsContainer } from './storage-item-save-actions-container';

export type StorageItemProps = {
  storageType: "main" | "save";
  pkmId: string;
  species: number;
  isEgg: boolean;
  isShiny: boolean;
  isShadow: boolean;
  heldItem?: number;
  selected?: boolean;
  onClick?: () => void;
  warning?: boolean;
  boxId: number;
  boxSlot: number;

  // actions
  canCreateVersion?: boolean;
  canMoveOutside?: boolean;
  canEvolve?: boolean;
  attached?: boolean;
  needSynchronize?: boolean;
};

export const StorageItem: React.FC<StorageItemProps> = ({
  storageType,
  pkmId,
  species,
  isEgg,
  isShiny,
  isShadow,
  heldItem = 0,
  selected,
  onClick,
  warning,
  boxId,
  boxSlot,

  canCreateVersion,
  canMoveOutside,
  canEvolve,
  attached,
  needSynchronize,
}) => {
  const [ hover, setHover ] = React.useState(false);

  const moveContext = StorageMoveContext.useValue();
  const moveDroppable = StorageMoveContext.useDroppable(storageType, boxId, boxSlot, pkmId);
  const moveDraggable = StorageMoveContext.useDraggable(pkmId, storageType);
  const moveLoading = StorageMoveContext.useLoading(storageType, boxId, boxSlot, pkmId);

  const staticData = useStaticData();

  const disabled = !moveDroppable.isCurrentItemDragging && moveDroppable.isDragging && !moveDroppable.onClick;

  if (moveLoading) {
    return <StorageItemPlaceholder
      storageType={storageType}
      boxId={boxId}
      boxSlot={boxSlot}
      pkmId={pkmId}
    />;
  }

  const sprite = isEgg
    ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png'
    : (isShiny
      ? staticData.species[ species ].spriteShiny
      : staticData.species[ species ].spriteDefault);

  const element = (
    <Popover
      ref={moveDraggable.ref}
      draggable={true}
      className={css({
        order: boxSlot,
        position: 'relative',
        display: 'inline-flex',
        alignSelf: "flex-start",
        // transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
        // zIndex: isDragging ? 1 : undefined,
      })}
    >
      <PopoverButton
        as={ButtonLike}
        componentDescriptor='button'
        // ref={setNodeRef}
        // {...listeners}
        // {...attributes}
        // as={onClick ? "button" : undefined}
        // borderRadius="small"
        onClick={moveDroppable.onClick ?? onClick}
        onPointerMove={moveDraggable.onPointerMove}
        onPointerUp={moveDroppable.onPointerUp}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        selected={selected}
        loading={moveLoading}
        disabled={disabled}
        noDropshadow={!onClick}
        style={{
          backgroundColor: disabled ? 'transparent' : theme.bg.light,
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
          }}
        />

        {heldItem > 0 && <img
          src={staticData.items[ heldItem ].sprite}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 30,
            height: 30,
          }}
        />}

        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center',
          }}
        >
          {isShiny && <ShinyIcon />}

          {!canMoveOutside && <div style={{
            width: 20,
            height: 20,
            borderRadius: 99,
            color: theme.text.light,
            backgroundColor: theme.bg.red,
          }}>
            <Icon name='logout' forButton />
          </div>}

          {canEvolve && <div style={{
            width: 20,
            height: 20,
            borderRadius: 99,
            color: theme.text.light,
            backgroundColor: theme.bg.primary,
          }}>
            <Icon name='sparkles' solid forButton />
          </div>}

          {attached && <div style={{
            width: 20,
            height: 20,
            borderRadius: 99,
            color: needSynchronize ? theme.text.light : undefined,
            backgroundColor: needSynchronize ? theme.bg.yellow : undefined,
          }}>
            <Icon name='link' forButton />
          </div>}

          {canCreateVersion && <div style={{
            width: 20,
            height: 20,
            borderRadius: 99,
            color: theme.text.light,
            backgroundColor: theme.bg.primary,
          }}>
            <Icon name='plus' solid forButton />
          </div>}

          {warning && <div style={{
            width: 20,
            height: 20,
            borderRadius: 99,
            color: theme.text.light,
            backgroundColor: theme.bg.yellow,
          }}>
            <Icon name='exclaimation' forButton />
          </div>}
        </div>
      </PopoverButton>

      {(selected || hover) && <PopoverPanel
        static
        anchor="right start"
        className={css({
          zIndex: 20,
          '&:hover': {
            zIndex: 25,
          }
        })}
      >
        {!moveLoading && !moveContext.selected && selected
          ? <>
            {storageType === 'main'
              ? <StorageItemMainActions />
              : <StorageItemSaveActions />}
          </>
          : <>
            {hover && <div
              className={cx('storage-item-title', css({
                // opacity: 0,
                pointerEvents: 'none',
              }))}
            >
              {storageType === 'main'
                ? <StorageItemMainActionsContainer pkmId={pkmId} />
                : <StorageItemSaveActionsContainer pkmId={pkmId} />}
            </div>}
          </>}
      </PopoverPanel>}
    </Popover>
  );

  return <div
    className={css({
      display: 'flex',
      alignSelf: "flex-start",
      order: boxSlot,
    })}
  >
    {!moveLoading && moveDraggable.renderItem(element)}
  </div>;
};
