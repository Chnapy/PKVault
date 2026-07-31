import { Accordion, ActionIcon, Box, Group, TextInput, type DefaultMantineColor, type StyleProp } from '@mantine/core';
import { AlertTriangleIcon, FileMinusIcon, FilePlusIcon, FolderIcon, FolderMinusIcon, FolderPlusIcon, MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
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
    const { t } = useTranslate();

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

    const renderTextInput = !isDesktop || isExclude;

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        controls: [
            // eslint-disable-next-line react-hooks/refs
            renderTextInput && !disabled && getSelectControl({
                main: false,
                label: t('action.select'),
                action: () => {
                    textInputRef.current?.focus();
                },
            }),
            !disabled && {
                name: 'delete' as const,
                label: t('action.delete'),
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                    }
                },
                spread: false,
                action: () => {
                    onRemove();
                },
            },
        ],
    });

    return <Accordion.Item
        value={name}
        {...focusProps}
    >
        <Group wrap='nowrap' gap='sm'>
            <Accordion.Control>
                <Group align='center' pr='md'>
                    <Box display='inline-flex' c={actionsInfos.color}>
                        <actionsInfos.Icon />
                    </Box>

                    <div style={{ flexGrow: 1, lineBreak: 'anywhere' }}>
                        {renderTextInput
                            ? <WithControlsIcons placement='out' icons={controlIcons('open')} w='100%'>
                                <TextInput
                                    ref={textInputRef}
                                    value={value}
                                    onChange={({ currentTarget }) => onEdit(currentTarget.value)}
                                    size='sm'
                                    style={{ flexGrow: 1 }}
                                    {...controlProps('open')}
                                />
                            </WithControlsIcons>
                            : value}
                    </div>

                    {!isExclude && <Group
                        color={hasError ? 'red' : undefined}
                    >
                        {hasWarning && <AlertTriangleIcon />}
                        {isLoading
                            ? '...'
                            : hasError
                                ? 'error'
                                : t('settings.form.saves.test.title', { count: results.length })}
                    </Group>}
                </Group>
            </Accordion.Control>

            {openFolder && !isExclude && !isGlob && <ActionIcon
                size="lg" variant="subtle" color="gray"
                onClick={() => openFolder(value, isDirectory)}
            >
                <FolderIcon />
            </ActionIcon>}

            <WithControlsIcons placement='out' icons={controlIcons('delete')}>
                <ActionIcon
                    size="lg" variant="subtle" color="gray"
                    onClick={onRemove}
                    {...controlProps('delete')}
                >
                    <TrashIcon />
                </ActionIcon>
            </WithControlsIcons>
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
                    wrap='nowrap'
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
