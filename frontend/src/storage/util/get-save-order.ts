import type { StorageSearchSchema } from '../../routes/storage';

export const getSaveOrder = (
    saves: StorageSearchSchema[ 'saves' ],
    saveId: number,
) => saves?.[ saveId ]?.order ?? (Math.max(...Object.values(saves ?? {}).map(save => save?.order ?? 0), 0) + 1);
