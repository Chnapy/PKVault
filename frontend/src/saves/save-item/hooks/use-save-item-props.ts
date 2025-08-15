import type { SaveCardContentFullProps } from '../../../ui/save-card/save-card-content-full';
import { useSaveInfosMain } from '../../hooks/use-save-infos-main';

export const useSaveItemProps = () => {
    const saveInfosQuery = useSaveInfosMain();

    return (saveId: number): SaveCardContentFullProps | null => {
        if (!saveInfosQuery.data) {
            return null;
        }

        const item = saveInfosQuery.data.data[ saveId ];

        return {
            id: item.id,
            generation: item.generation,
            version: item.version,
            trainerName: item.trainerName,
            trainerGenderMale: item.trainerGender === 0,
            tid: item.tid,
            lastWriteTime: item.lastWriteTime,
            playTime: item.playTime,
            dexSeenCount: item.dexSeenCount,
            dexCaughtCount: item.dexCaughtCount,
            ownedCount: item.ownedCount,
            shinyCount: item.shinyCount,
        }
    };
};
