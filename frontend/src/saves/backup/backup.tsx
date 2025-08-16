import type React from 'react';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { Container } from '../../ui/container/container';
import { getBackupGetAllQueryKey, useBackupDelete, useBackupGetAll, useBackupRestore } from '../../data/sdk/backup/backup.gen';
import { TextContainer } from '../../ui/text-container/text-container';
import { useQueryClient } from '@tanstack/react-query';

export const Backup: React.FC = () => {
    const backupQuery = useBackupGetAll();

    const queryClient = useQueryClient();

    const backupDeleteMutation = useBackupDelete({
        mutation: {
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: getBackupGetAllQueryKey(),
                });
            },
        },
    });

    const backupRestoreMutation = useBackupRestore({
        mutation: {
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: getBackupGetAllQueryKey(),
                });
            },
        },
    });

    if (!backupQuery.data) {
        return null;
    }

    const normTo2 = (value: number) => `${value < 10 ? "0" : ""}${value}`;

    return <div style={{
        // width: '100%'
    }}>
        Backups ({backupQuery.data.data.length})

        <div style={{
            display: 'flex',
            gap: 8
        }}>
            {backupQuery.data.data.map(backup => {

                const date = new Date(backup.createdAt);

                const renderTimestamp = () =>
                    `${normTo2(date.getDate())}/${normTo2(date.getMonth() + 1)}/${normTo2(date.getFullYear() - 2000)} - ${normTo2(
                        date.getHours()
                    )}:${normTo2(date.getMinutes())}:${normTo2(date.getSeconds())}`;

                return <Container key={backup.createdAt}>

                    <TextContainer>
                        {renderTimestamp()}

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 4,
                        }}>
                            <ButtonWithConfirm onClick={() => backupRestoreMutation.mutateAsync({
                                params: {
                                    createdAt: backup.createdAt,
                                }
                            })}>Restore</ButtonWithConfirm>

                            <ButtonWithConfirm onClick={() => backupDeleteMutation.mutateAsync({
                                params: {
                                    createdAt: backup.createdAt,
                                }
                            })}>Delete</ButtonWithConfirm>
                        </div>
                    </TextContainer>

                </Container>;
            })}
        </div>
    </div>
}
