import { Divider, Table } from '@mantine/core';
import { AlertCircleIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../translate/i18n';
import { UIPopoverCard } from '../../ui-new/popover/popover-card/ui-popover-card';

export type NotificationCardProps = {
    warningsCount: number;
    errorsCount: number;
    update: React.ReactNode;
    saveDuplicateWarnings: React.ReactNode;
    pkmVariantWarnings: React.ReactNode;
    saveChangedWarnings: React.ReactNode;
    errors: React.ReactNode;
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
    warningsCount, errorsCount, update, saveDuplicateWarnings, pkmVariantWarnings, saveChangedWarnings, errors
}) => {
    const { t } = useTranslate();

    const hasErrorsAndWarnings = errorsCount > 0 && (warningsCount > 0 || !!update);

    const title = [
        warningsCount > 0 && t('notifications.warnings', { count: warningsCount }),
        errorsCount > 0 && t('notifications.errors', { count: errorsCount }),
    ].filter(Boolean).join(' / ');

    return <UIPopoverCard
        icon={<AlertCircleIcon />}
        title={title}
        miw={300}
    >
        <Table
            // maw={600}
            style={{ wordBreak: 'break-word' }}
        >
            <Table.Tbody>
                {update}

                {saveDuplicateWarnings}
                {pkmVariantWarnings}
                {saveChangedWarnings}

                {hasErrorsAndWarnings && <Table.Tr><Table.Td>
                    <Divider />
                </Table.Td></Table.Tr>}

                {errors}
            </Table.Tbody>
        </Table>
    </UIPopoverCard>;
};
