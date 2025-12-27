
const itemSize = 96;

export const SizingUtil = {
    itemSize,
    itemFullSize: itemSize + 2, // + border
    itemsGap: 4,
    getMaxWidth: (lineItemCount: number) => lineItemCount * SizingUtil.itemFullSize + (lineItemCount - 1) * SizingUtil.itemsGap,
    getMaxHeight: () => SizingUtil.getMaxWidth(5),
};
