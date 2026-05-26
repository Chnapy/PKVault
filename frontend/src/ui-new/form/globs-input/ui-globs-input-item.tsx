import { Accordion, ActionIcon, Box, Group, TextInput, type DefaultMantineColor, type StyleProp } from '@mantine/core';
import { FileMinusIcon, FilePlusIcon, FolderIcon, FolderMinusIcon, FolderPlusIcon, MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { UIPathLine } from '../../path/ui-path-line';

export type UIGlobsInputItemProps = {
    name: string;
    value: string;
    onEdit: (value: string) => void;
    onRemove: () => void;
    disabled?: boolean;
    results: string[];
    isDesktop: boolean;
    isLoading?: boolean;
    hasWarning?: boolean;
    hasError?: boolean;
    openFolder?: (path: string, isDirectory: boolean) => void;
};

export const UIGlobsInputItem: React.FC<UIGlobsInputItemProps> = ({
    name, value, onEdit, onRemove, results, disabled, isDesktop, isLoading, hasWarning, hasError, openFolder
}) => {
    const isGlob = value.includes('*');
    const isDirectory = isGlob || value.endsWith('/');
    const isExclude = value.startsWith('!');

    const actionsInfos = isExclude
        ? {
            Symbol: MinusIcon,
            Icon: isDirectory ? FolderMinusIcon : FileMinusIcon,
            color: 'red' satisfies StyleProp<DefaultMantineColor>,
        }
        : {
            Symbol: PlusIcon,
            Icon: isDirectory ? FolderPlusIcon : FilePlusIcon,
            color: 'blue' satisfies StyleProp<DefaultMantineColor>,
        };

    const textInputRef = React.useRef<HTMLInputElement>(null);

    const { focusControlProps, focused } = useFocusControls<HTMLInputElement>({
        scopeNodeId: name,
        controls: [
            {
                name: name + '-select',
                label: 'Select',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'A' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    textInputRef.current?.focus();
                },
            },
            {
                name: name + '-delete',
                label: 'Delete',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    onRemove();
                },
            },
        ],
    });

    return <Accordion.Item
        value={value}
        {...focusControlProps}
    >

        <Group wrap='nowrap' gap='sm'>
            <Accordion.Control>
                <Group align='center' pr='md'>
                    <Box display='inline-flex' c={actionsInfos.color}>
                        <actionsInfos.Icon />
                    </Box>

                    <div style={{ flexGrow: 1, lineBreak: 'anywhere' }}>
                        {isDesktop && !isExclude
                            ? value
                            : <TextInput
                                ref={textInputRef}
                                value={value}
                                onChange={({ currentTarget }) => onEdit(currentTarget.value)}
                                disabled={disabled}
                                size='xs'
                            />}
                    </div>

                    {!isExclude && <Group
                        color={hasError ? 'red' : undefined}
                    >
                        {/* {hasWarning && <Icon name='exclamation-triangle' solid forButton />} */}
                        {isLoading
                            ? '...'
                            : hasError
                                ? 'error'
                                : `${results.length} files found`}
                    </Group>}
                </Group>
            </Accordion.Control>

            {openFolder && !isExclude && !isGlob && <ActionIcon
                size="lg" variant="subtle" color="gray"
                onClick={() => openFolder(value, isDirectory)}
            >
                <FolderIcon />
            </ActionIcon>}

            <ActionIcon
                size="lg" variant="subtle" color="gray"
                onClick={onRemove}
                disabled={disabled}
            >
                <TrashIcon />
            </ActionIcon>
        </Group>

        {results.length > 0 && <Accordion.Panel>
            <pre style={{
                fontFamily: 'inherit',
                maxHeight: 200,
                overflow: 'auto',
                padding: 4,
                margin: 0,
            }}>
                {!isLoading && results.map(path => <Group
                    key={path}
                    align='center'
                >
                    <Box display='inline-flex' c={actionsInfos.color}>
                        <actionsInfos.Symbol />
                    </Box>
                    <UIPathLine>{path}</UIPathLine>
                </Group>)}
            </pre>
        </Accordion.Panel>}
    </Accordion.Item>;
};
