import { ActionIcon, Table, Text, Tooltip } from '@mantine/core';
import { ArchiveRestoreIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { UIConfirmPopover } from '../../confirm-popover/ui-confirm-popover';
import { UITextInput } from '../../form/text-input/ui-text-input';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { Focus } from '../../interaction/focus/provider/use-focus-context';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';

type UIBackupItemProps = {
    createdAt: string;
    path: string;
    // backup_before_save_bkp_2026-04-25T125948-832Z.zip
    filename: string;
    onRestore: () => void;
    onDelete: () => void;
};

export const UIBackupItem: React.FC<UIBackupItemProps> = ({ createdAt, path, filename, onRestore, onDelete }) => {

    const splitBy_ = filename.split('_');
    splitBy_.pop();

    const date = new Date(createdAt);

    const name = splitBy_.join('_');

    const restoreRef = React.useRef<HTMLButtonElement>(null);
    const deleteRef = React.useRef<HTMLButtonElement>(null);

    const { pushScope } = Focus.usePushPopScope();

    const inputScopeId = filename + '-input-scope';

    const { focusControlProps, nodeId } = useFocusControls({
        scopeNodeId: filename,
        controls: [
            getSelectControl({
                label: 'Edit name',
                action: (e, trigger, value) => {
                    pushScope(inputScopeId);
                },
            }),
            {
                name: filename + '-restore',
                label: 'Restore',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'X' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    restoreRef.current?.click();
                },
            },
            {
                name: filename + '-delete',
                label: 'Delete',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    deleteRef.current?.click();
                },
            },
        ],
    });

    return <Table.Tr
        {...focusControlProps}
    >
        <Table.Th>
            <Text>{date.getHours()}h{date.getMinutes()}</Text>
        </Table.Th>

        <Table.Td>
            {/* <Badge variant='light'>{name}</Badge> */}
            <FocusScope id={inputScopeId} parentNodeId={nodeId}>
                <UITextInput
                    name={filename + '-input'}
                    value={name}
                    // maw={200}
                    styles={{
                        input: {
                            height: 'auto',
                            minHeight: 0,
                            lineHeight: 'inherit',
                        },
                    }}
                    onSubmit={console.log}
                    onCancel={console.log}
                />
            </FocusScope>
        </Table.Td>
        <Table.Td>
            <Tooltip label={path}>
                <Text span>
                    {filename}
                </Text>
            </Tooltip>
        </Table.Td>

        <Table.Td>
            <UIConfirmPopover label='Restore backup' action={onRestore}>
                <ActionIcon ref={restoreRef} variant='subtle' color='blue'>
                    <ArchiveRestoreIcon />
                </ActionIcon>
            </UIConfirmPopover>
        </Table.Td>
        <Table.Td>
            <UIConfirmPopover label='Delete backup' action={onDelete}>
                <ActionIcon ref={deleteRef} variant='subtle' color='red'>
                    <TrashIcon />
                </ActionIcon>
            </UIConfirmPopover>
        </Table.Td>
    </Table.Tr>;
};
