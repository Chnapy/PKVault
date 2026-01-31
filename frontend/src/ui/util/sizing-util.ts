const itemSize = 96;

/**
 * Sizing utility for box
 */
export const SizingUtil = {
    itemSize,
    itemFullSize: itemSize + 2, // + border
    itemsGap: 4,
    getMaxWidth: (lineItemCount: number) => lineItemCount * SizingUtil.itemFullSize + (lineItemCount - 1) * SizingUtil.itemsGap,
    getMaxHeight: () => SizingUtil.getMaxWidth(5),
    /**
     * Items count per line, following PKHeX layout.
     */
    getItemsPerLine: (boxSlotCount: number) => {
        if (boxSlotCount <= 6) {
            return boxSlotCount;
        }

        switch (boxSlotCount) {
            case 20:
                return 4;
            case 25:
                return 5;
            case 30:
                return 6;
        }

        return 6;
    },
};
