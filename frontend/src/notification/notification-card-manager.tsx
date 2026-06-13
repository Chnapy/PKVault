import { ActionIcon, Table } from '@mantine/core';
import { TrashIcon } from 'lucide-react';
import React from 'react';
import { BackendErrorsContext } from '../data/backend-errors-context';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { NotificationCard } from '../ui/notification-card/notification-card';
import { useCheckUpdate } from './hooks/use-check-update';
import { HasUpdateWarning } from './warnings/has-update-warning';
import { PkmVariantWarning } from './warnings/pkm-variant-warning';
import { SaveChangedWarning } from './warnings/save-changed-warning';
import { SaveDuplicateWarning } from './warnings/save-duplicate-warning';

export const NotificationCardManager: React.FC = () => {
    const { errors, removeIndex } = BackendErrorsContext.useValue();

    const hasUpdate = !!useCheckUpdate();
    const warnings = useWarningsGetWarnings().data?.data;

    return <NotificationCard
        warningsCount={warnings?.warningsCount ?? 0}
        errorsCount={errors.length}
        update={hasUpdate && <HasUpdateWarning />}
        saveDuplicateWarnings={warnings?.saveDuplicateWarnings.map((warn, i) => <SaveDuplicateWarning key={i} {...warn} />)}
        pkmVariantWarnings={warnings?.pkmVariantWarnings.map((warn, i) => <PkmVariantWarning key={i} {...warn} />)}
        saveChangedWarnings={warnings?.saveChangedWarnings.map((warn, i) => <SaveChangedWarning key={i} {...warn} />)}
        errors={errors.map((error, i) => {
            return <Table.Tr key={i}>
                <Table.Td>
                    <details>
                        <summary style={{
                            whiteSpace: 'break-spaces',
                            cursor: 'pointer'
                        }}>{error.message}</summary>

                        <code style={{
                            display: 'flex',
                            fontSize: '75%',
                            // backgroundColor: theme.bg.contrastdark,
                            padding: 4,
                            maxHeight: 200,
                            overflowY: 'auto',
                        }}>
                            {error.stack}
                        </code>
                    </details>
                </Table.Td>
                <Table.Td valign='top'>
                    <ActionIcon
                        variant='default'
                        onClick={() => removeIndex(i)}
                        size='sm'
                    >
                        <TrashIcon fontSize='1lh' />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>;
        })}
    />;
};
