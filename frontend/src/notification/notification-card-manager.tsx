import { ActionIcon, Code, Group, ScrollArea, Table } from '@mantine/core';
import { InfoIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { BackendErrorsContext } from '../data/backend-errors-context';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { UINotificationCard } from '../ui/notification-card/ui-notification-card';
import { useCheckUpdate } from './hooks/use-check-update';
import { HasUpdateWarning } from './warnings/has-update-warning';
import { PkmVariantWarning } from './warnings/pkm-variant-warning';
import { SaveChangedWarning } from './warnings/save-changed-warning';

export const NotificationCardManager: React.FC = () => {
    const { errors, removeIndex } = BackendErrorsContext.useValue();

    const hasUpdate = !!useCheckUpdate();
    const warnings = useWarningsGetWarnings().data?.data;

    return <UINotificationCard
        warningsCount={warnings?.warningsCount ?? 0}
        errorsCount={errors.length}
        update={hasUpdate && <HasUpdateWarning />}
        pkmVariantWarnings={warnings?.pkmVariantWarnings.map((warn, i) => <PkmVariantWarning key={i} {...warn} />)}
        saveChangedWarnings={warnings?.saveChangedWarnings.map((warn, i) => <SaveChangedWarning key={i} {...warn} />)}
        errors={errors.map((error, i) => {
            return <Table.Tr key={i}>
                <Table.Td>
                    <details>
                        <summary style={{
                            whiteSpace: 'break-spaces',
                            cursor: 'pointer'
                        }}>
                            <Group display='inline-flex' gap='sm' c='red' style={{ verticalAlign: 'top' }}>
                                <InfoIcon />
                                {error.message}
                            </Group>
                        </summary>

                        <ScrollArea maw={500}>
                            <Code block p='md'>
                                {error.stack}
                            </Code>
                        </ScrollArea>
                    </details>
                </Table.Td>
                <Table.Td valign='top' w={0}>
                    <ActionIcon
                        color='red'
                        onClick={() => removeIndex(i)}
                    >
                        <TrashIcon fontSize='1lh' />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>;
        })}
    />;
};
