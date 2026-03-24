import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import type { SaveCardContentFullProps } from '../../../ui/save-card/save-card-content-full';

export const useSaveItemProps = () => {
    const saveInfosQuery = useSaveInfosGetAll();

    return (saveId: number): SaveCardContentFullProps | null => {
        if (!saveInfosQuery.data) {
            return null;
        }

        const item = saveInfosQuery.data.data[ saveId ];
        if (!item) {
            return null;
        }

        return {
            id: item.id,
            context: item.context,
            version: item.version,
            trainerName: item.trainerName,
            trainerGender: item.trainerGender,
            tid: item.tid,
            sid: item.sid,
            language: item.language,
            path: item.path,
            lastWriteTime: item.lastWriteTime,
            playTime: item.playTime,
            dexSeenCount: item.dexSeenCount,
            dexCaughtCount: item.dexCaughtCount,
            ownedCount: item.ownedCount,
            shinyCount: item.shinyCount,
        }
    };
};
