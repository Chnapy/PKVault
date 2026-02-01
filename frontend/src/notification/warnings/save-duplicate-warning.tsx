import React from 'react';
import type { SaveDuplicateWarning as SaveDuplicateWarningModel } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { css } from '@emotion/css';

export const SaveDuplicateWarning: React.FC<SaveDuplicateWarningModel> = ({ saveId, paths }) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const saveInfosQuery = useSaveInfosGetAll();

    const save = saveInfosQuery.data?.data[ saveId ];
    if (!save) {
        return null;
    }

    return <tr>
        <td className={css({ whiteSpace: 'pre-line' })}>
            {t('notifications.warnings.save-duplicate', {
                saveName: staticData.versions[ save.version ]?.name,
                paths: paths.join('\n'),
            })}
        </td>
    </tr>;
};
