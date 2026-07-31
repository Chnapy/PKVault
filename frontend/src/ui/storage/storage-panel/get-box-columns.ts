export const getBoxColumns = (slotCount: number) => {
    switch (slotCount) {
        case 30: return 6;
        case 25: return 5;
        case 20: return 4;
        default: return undefined;
    }
};
