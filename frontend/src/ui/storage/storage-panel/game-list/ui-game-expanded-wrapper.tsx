import { Button, Divider, Group, Image, Stack, Text, Tooltip } from '@mantine/core';
import { PenIcon } from 'lucide-react';
import React from 'react';
import { WithControlsIcons } from '../../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';
import { UIPathLine } from '../../../path/ui-path-line';
import { UIPopover } from '../../../popover/ui-popover';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import { useTranslate } from '../../../../translate/i18n';

export type UIGameExpandedWrapperProps = {
    selected?: boolean;
    loading?: boolean;
    onSelect?: () => void;
    editDropdown?: React.ReactNode;
    actions?: React.ReactNode;

    title?: string;
    label: React.ReactNode;
    imgSrc: string;
    secondaryLine: React.ReactNode;
    tertiaryLine: React.ReactNode;
    fourthLine?: React.ReactNode;
    path: string;
};

export const UIGameExpandedWrapper: React.FC<UIGameExpandedWrapperProps> = ({
    title, label, imgSrc, secondaryLine, tertiaryLine, fourthLine, path,
    selected, loading, onSelect, editDropdown, actions,
}) => {
    const { t } = useTranslate();

    const panel = useCurrentPanel();

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: `game_${path}`,
        focusOnMount: selected,
        onFocus: () => {
            panel.normalizeCurrentPanel();
        },
        controls: [
            !selected && onSelect && getSelectControl({
                label: t('action.select'),
                action: () => {
                    onSelect();
                },
            }),
            !!editDropdown && {
                name: 'edit' as const,
                label: t('storage.actions.edit'),
                triggers: {
                    mouse: {
                        type: 'mouse',
                        values: [ 'left-click' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'X' ],
                    },
                },
                spread: false,
            },
        ],
    });

    return <Group w={288} gap='xs' align='flex-start' wrap='nowrap'>

        <Stack gap='xs'>
            <Image
                src={imgSrc}
                w={44}
                radius='md'
            />

            {!loading && <>

                {editDropdown && <UIPopover
                    dropdown={editDropdown}
                >
                    <Tooltip label={t('save.detected.change')}>
                        <WithControlsIcons placement='out' icons={controlIcons('edit')}>
                            <Button
                                variant='filled'
                                color='blue'
                                size='compact-xs'
                                fullWidth
                                {...controlProps('edit')}
                            >
                                <PenIcon />
                            </Button>
                        </WithControlsIcons>
                    </Tooltip>
                </UIPopover>}

                {actions}
            </>}
        </Stack>

        <WithControlsIcons placement='out' icons={controlIcons('open')} miw={0} style={{ flexGrow: 1 }}>
            <Button
                variant='default'
                loading={loading}
                {...focusProps}
                {...controlProps('open')}
                title={title}
                h='auto'
                style={{ flexGrow: 1, flexShrink: 1 }}
            >
                <Stack w='100%' align='stretch' gap={0}>
                    <Text>
                        {label}
                    </Text>

                    <Divider my='xs' />

                    <Text>
                        {secondaryLine}
                    </Text>

                    <Group
                        component={Text}
                        wrap='nowrap'
                        mx='auto'
                        style={{
                            textWrap: 'nowrap',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {tertiaryLine}
                    </Group>

                    {fourthLine && <Group
                        component={Text}
                        gap='sm'
                        wrap='nowrap'
                        mx='auto'
                        style={{
                            textWrap: 'nowrap',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {fourthLine}
                    </Group>}

                    <Divider my='xs' />

                    <Text>
                        <UIPathLine style={{ maxWidth: 200 }}>{path}</UIPathLine>
                    </Text>
                </Stack>
            </Button>
        </WithControlsIcons>
    </Group>;
};
