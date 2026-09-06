export const getDropPositions = (dropPos: number, selectedIds: string[], idPositions: Record<string, number>): Record<string, number> => {
    const firstId = selectedIds[0];
    if (!firstId) return idPositions;

    const firstIdPos = idPositions[firstId]!;
    const delta = dropPos - firstIdPos;

    return Object.fromEntries(
        selectedIds.map(id => [
            id,
            idPositions[id]! + delta,
        ] as const)
    );
};
