import { Table } from '@mantine/core';
import React from 'react';
import type { SaveDuplicateWarning as SaveDuplicateWarningModel } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';

export const SaveDuplicateWarning: React.FC<SaveDuplicateWarningModel> = ({ saveId, paths }) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const saveInfosQuery = useSaveInfosGetAll();

    const save = saveInfosQuery.data?.data[ saveId ];
    if (!save) {
        return null;
    }

    return <Table.Tr>
        <Table.Td style={{ whiteSpace: 'pre-line' }}>
            {t('notifications.warnings.save-duplicate', {
                saveName: staticData.versions[ save.version ]?.name,
                paths: paths.join('\n'),
            })}
        </Table.Td>
    </Table.Tr>;
};
