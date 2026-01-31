import type React from 'react';
import type { SaveChangedWarning as SaveChangedWarningModel } from '../data/sdk/model';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../hooks/use-static-data';
import { useTranslate } from '../translate/i18n';

export const SaveChangedWarning: React.FC<SaveChangedWarningModel> = ({ saveId }) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const saveInfosQuery = useSaveInfosGetAll();

    const save = saveInfosQuery.data?.data[ saveId ];

    if (!save) {
        return null;
    }

    return <tr>
        <td>
            {t('notifications.warnings.save-changed', {
                saveName: staticData.versions[ save.version ]?.name,
                path: save.path,
            })}
        </td>
    </tr>;
};
