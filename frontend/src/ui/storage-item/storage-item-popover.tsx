import { css, cx } from '@emotion/css';
import { Popover, PopoverPanel } from '@headlessui/react';
import React from 'react';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import type { ButtonLikeProps } from '../button/button-like';
import type { ButtonWithDisabledPopoverProps } from '../button/button-with-disabled-popover';
import { StorageItemMainActions } from './storage-item-main-actions';
import { StorageItemMainActionsContainer } from './storage-item-main-actions-container';
import { StorageItemPlaceholder } from './storage-item-placeholder';
import { StorageItemSaveActions } from './storage-item-save-actions';
import { StorageItemSaveActionsContainer } from './storage-item-save-actions-container';

export type StorageItemPopoverProps = {
    saveId?: number;
    pkmId: string;
    selected?: boolean;
    boxId: number;
    boxSlot: number;

    children: (props: ButtonLikeProps & Pick<ButtonWithDisabledPopoverProps<never>, 'anchor' | 'helpTitle'>) => React.ReactNode;
};

export const StorageItemPopover: React.FC<StorageItemPopoverProps> = ({
    saveId,
    pkmId,
    selected,
    boxId,
    boxSlot,
    children
}) => {
    const [ hover, setHover ] = React.useState(false);

    const moveContext = StorageMoveContext.useValue();
    const moveDroppable = StorageMoveContext.useDroppable(saveId, boxId, boxSlot, pkmId);
    const moveDraggable = StorageMoveContext.useDraggable(pkmId, saveId);
    const moveLoading = StorageMoveContext.useLoading(saveId, boxId, boxSlot, pkmId);

    const disabled = !moveDroppable.isCurrentItemDragging && moveDroppable.isDragging && !moveDroppable.onClick;

    if (moveLoading) {
        return <StorageItemPlaceholder
            saveId={saveId}
            boxId={boxId}
            boxSlot={boxSlot}
            pkmId={pkmId}
        />;
    }

    const element = (
        <Popover
            draggable={true}
            className={css({
                order: boxSlot,
                position: 'relative',
                display: 'inline-flex',
                alignSelf: "flex-start",
            })}
        >
            {children({
                onClick: moveDroppable.onClick,
                onPointerMove: moveDraggable.onPointerMove,
                onPointerUp: moveDroppable.onPointerUp,
                onPointerEnter: () => setHover(true),
                onPointerLeave: () => setHover(false),
                selected,
                loading: moveLoading,
                disabled,
                anchor: 'top',
                helpTitle: moveDroppable.helpText,
            })}

            {(selected || hover) && <PopoverPanel
                static
                anchor="right start"
                className={css({
                    zIndex: 18,
                    '&:hover': {
                        zIndex: 25,
                    }
                })}
            >
                {!moveLoading && !moveContext.selected && selected
                    ? (saveId ? <StorageItemSaveActions saveId={saveId} /> : <StorageItemMainActions />)
                    : <>
                        {hover && <div
                            className={cx('storage-item-title', css({
                                // opacity: 0,
                                pointerEvents: 'none',
                            }))}
                        >
                            {saveId
                                ? <StorageItemSaveActionsContainer saveId={saveId} pkmId={pkmId} />
                                : <StorageItemMainActionsContainer pkmId={pkmId} />}
                        </div>}
                    </>}
            </PopoverPanel>}
        </Popover>
    );

    return !moveLoading && moveDraggable.renderItem(element);
};
