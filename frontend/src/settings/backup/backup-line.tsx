import { css } from '@emotion/css';
import React from 'react';
import { useBackupDelete, useBackupRestore } from '../../data/sdk/backup/backup.gen';
import type { BackupDTO } from '../../data/sdk/model';
import { Button } from '../../ui/button/button';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { renderTime } from '../../ui/util/render-date-time';
import { useDesktopMessage } from '../globs-input/hooks/use-desktop-message';
import { BackupLineForm } from './backup-line-form';

export const BackupLine: React.FC<BackupDTO> = ({ createdAt, filepath, name }) => {
    const desktopMessage = useDesktopMessage();

    const backupRestoreMutation = useBackupRestore();
    const backupDeleteMutation = useBackupDelete();

    const [ editMode, setEditMode ] = React.useState(false);

    return <div className={css({
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
    })}>
        <span
            className={css({
                minWidth: 50,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                marginRight: 16,
                cursor: desktopMessage ? 'pointer' : undefined,
            })}
            role='button'
            onClick={desktopMessage
                ? (() => desktopMessage.openFile({
                    type: 'open-folder',
                    isDirectory: true,
                    path: filepath,
                }))
                : undefined}
        >
            {renderTime(new Date(createdAt))}
        </span>

        <div
            className={css({
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 4,
                paddingRight: 16,
            })}
        >
            {editMode
                ? <BackupLineForm createdAt={createdAt} name={name} onCancel={() => setEditMode(false)} />
                : <>
                    {name}

                    <Button
                        className={css({ fontSize: 14 })}
                        onClick={() => setEditMode(true)}
                    >
                        <Icon name='pen' forButton />
                    </Button>
                </>}
        </div>

        <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: 4
        })}>
            <ButtonWithConfirm
                onClick={() => backupRestoreMutation.mutateAsync({
                    params: {
                        createdAt,
                    }
                })}
                bgColor={theme.bg.primary}
                disabled={editMode}
            >
                <Icon name='upload' forButton />
            </ButtonWithConfirm>

            {/* <Button<'a'> as='a' href={downloadUrl}> // TODO download backup
                <Icon name='download' forButton />
            </Button> */}

            <ButtonWithConfirm
                onClick={() => backupDeleteMutation.mutateAsync({
                    params: {
                        createdAt,
                    }
                })}
                bgColor={theme.bg.red}
                disabled={editMode}
            >
                <Icon name='trash' solid forButton />
            </ButtonWithConfirm>
        </div>
    </div>;
};
