import { Card, SimpleGrid } from '@mantine/core';
import type React from "react";
import { UIInputLabel } from '../../ui-new/form/ui-input-label';
import { UIBallIcon } from '../../ui-new/icon/ui-ball-icon';

export const SettingsExternalLeft: React.FC = () => {
    // const { t } = useTranslate();

    // const settingsQuery = useSettingsGet();
    // const settingsMutation = useSettingsEdit();

    // const settings = settingsQuery.data?.data;
    // const settingsMutable = settings?.settingsMutable;

    // const form = useFormContext<SettingsFormData>();

    return <>
        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<UIBallIcon />} label='Foo' />
                <div>bar</div>
            </SimpleGrid>
        </Card>
    </>;
};
