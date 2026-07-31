import { ActionIcon, Table, Text, Tooltip } from '@mantine/core';
import { ArchiveRestoreIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { Focus } from '../../interaction/focus/provider/use-focus-context';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';
import { UIConfirmPopover } from '../../popover/ui-confirm-popover';

type UIBackupItemProps = {
    order: number;
    createdAt: string;
    path: string;
    // backup_before_save_bkp_2026-04-25T125948-832Z.zip
    filename: string;
    onRestore: () => void;
    onDelete: () => void;
    children: React.ReactNode;
};

export const UIBackupItem: React.FC<UIBackupItemProps> = ({ order, createdAt, path, filename, onRestore, onDelete, children }) => {
    const { t } = useTranslate();

    const splitBy_ = filename.split('_');
    splitBy_.pop();

    const date = new Date(createdAt);

    const { pushScope } = Focus.usePushPopScope();

    const inputScopeId = createdAt + '-input-scope';

    const { focusProps, controlProps, controlIcons, nodeId, focused } = useFocusControls({
        scopeNodeId: `bkp-${order}`,
        order,
        controls: [
            getSelectControl({
                label: t('settings.backups.name.edit'),
                action: () => {
                    if (focused)
                        pushScope(inputScopeId);
                },
            }),
            {
                name: 'restore' as const,
                label: t('settings.backups.restore'),
                triggers: {
                    mouse: {
                        type: 'mouse',
                        values: [ 'left-click' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'X' ],
                    }
                },
                spread: false,
            },
            {
                name: 'delete' as const,
                label: t('action.delete'),
                triggers: {
                    mouse: {
                        type: 'mouse',
                        values: [ 'left-click' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                    }
                },
                spread: false,
            },
        ],
    });

    return <Table.Tr
        {...focusProps}
        {...controlProps('open')}
        bdrs='md'
    >
        <Table.Th>
            <Text>{date.getHours()}h{date.getMinutes()}</Text>
        </Table.Th>

        <Table.Td>
            <WithControlsIcons placement='out' icons={controlIcons('open')}>
                <FocusScope id={inputScopeId} parentNodeId={nodeId}>
                    {children}
                </FocusScope>
            </WithControlsIcons>
        </Table.Td>
        <Table.Td>
            <Tooltip label={path}>
                <Text span>
                    {filename}
                </Text>
            </Tooltip>
        </Table.Td>

        <Table.Td>
            <UIConfirmPopover label={t('settings.backups.restore')} color='blue' action={onRestore}>
                <Tooltip label='Restore backup'>
                    <WithControlsIcons placement='out' icons={controlIcons('restore')}>
                        <ActionIcon variant='subtle' color='blue' {...controlProps('restore')}>
                            <ArchiveRestoreIcon />
                        </ActionIcon>
                    </WithControlsIcons>
                </Tooltip>
            </UIConfirmPopover>
        </Table.Td>
        <Table.Td>
            <UIConfirmPopover label={t('action.delete')} color='red' action={onDelete}>
                <WithControlsIcons placement='out' icons={controlIcons('delete')}>
                    <ActionIcon variant='subtle' color='red' {...controlProps('delete')}>
                        <TrashIcon />
                    </ActionIcon>
                </WithControlsIcons>
            </UIConfirmPopover>
        </Table.Td>
    </Table.Tr>;
};
