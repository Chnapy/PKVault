import { ActionIcon, Table, Text, Tooltip } from '@mantine/core';
import { ArchiveRestoreIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { UIConfirmPopover } from '../../popover/ui-confirm-popover';
import { UITextInput } from '../../form/text-input/ui-text-input';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
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

    const { pushScope } = Focus.usePushPopScope();

    const inputScopeId = filename + '-input-scope';

    const { focusProps, controlProps, controlIcons, nodeId } = useFocusControls({
        scopeNodeId: filename,
        controls: [
            getSelectControl({
                label: 'Edit name',
                action: () => {
                    pushScope(inputScopeId);
                },
            }),
            {
                name: 'restore' as const,
                label: 'Restore',
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
                label: 'Delete',
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
            <UIConfirmPopover label='Restore backup' color='blue' action={onRestore}>
                <WithControlsIcons placement='out' icons={controlIcons('restore')}>
                    <ActionIcon variant='subtle' color='blue' {...controlProps('restore')}>
                        <ArchiveRestoreIcon />
                    </ActionIcon>
                </WithControlsIcons>
            </UIConfirmPopover>
        </Table.Td>
        <Table.Td>
            <UIConfirmPopover label='Delete backup' color='red' action={onDelete}>
                <WithControlsIcons placement='out' icons={controlIcons('delete')}>
                    <ActionIcon variant='subtle' color='red' {...controlProps('delete')}>
                        <TrashIcon />
                    </ActionIcon>
                </WithControlsIcons>
            </UIConfirmPopover>
        </Table.Td>
    </Table.Tr>;
};
