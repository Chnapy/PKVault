import type { SaveInfosDTO } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';

export const useSaveInfosMain = () => {
    const saveInfosQuery = useSaveInfosGetAll();

    const data = saveInfosQuery.data && {
        ...saveInfosQuery.data,
        data: Object.entries(saveInfosQuery.data.data)
            .reduce<Record<string, SaveInfosDTO>>((acc, [ id, data ]) => {
                const mainSave = data.find(save => !save.isBackup);
                if (!mainSave) {
                    return acc;
                }

                return {
                    ...acc,
                    [ id ]: mainSave,
                };
            }, {}),
    };

    return {
        ...saveInfosQuery,
        data,
    };
};
