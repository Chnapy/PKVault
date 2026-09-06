import { Button, Divider, Group, Image, Stack, Text } from '@mantine/core';
import { clsx } from 'clsx';
import { CopyIcon, FileXIcon, PenIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { useClickLoading } from '../../../form/button/hooks/use-click-loading';
import { UIIconWrapper } from '../../../icon/ui-icon-wrapper';
import { WithControlsIcons } from '../../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';
import { UIPathLine } from '../../../path/ui-path-line';
import { UIPokedexIcons } from '../../../pokedex/icons/ui-pokedex-icons';
import { UIPopover } from '../../../popover/ui-popover';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import classes from './ui-game-expanded-wrapper.module.css';
import { gameExpandedConstants } from './util/game-expanded-constants';

export type UIGameExpandedWrapperProps = {
    selected?: boolean;
    loading?: boolean;
    disabled?: boolean;
    onSelect?: () => unknown;
    editDropdown?: React.ReactNode;
    hasDuplicates?: boolean;
    actions?: React.ReactNode;

    id?: string;
    label: React.ReactNode;
    imgSrc: string;
    secondaryLine: React.ReactNode;
    tertiaryLine: React.ReactNode;
    fourthLine?: React.ReactNode;
    path: string;
    missingFile?: boolean;
};

export const UIGameExpandedWrapper: React.FC<UIGameExpandedWrapperProps> = ({
    id, label, imgSrc, secondaryLine, tertiaryLine, fourthLine, path, missingFile,
    selected, loading: loadingInner, disabled, onSelect: onSelectInner, editDropdown, hasDuplicates, actions,
}) => {
    const { t } = useTranslate();

    const panel = useCurrentPanel();

    const { onClick: onSelect, loading } = useClickLoading(onSelectInner, loadingInner);

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: `game_${path}`,
        focusOnMount: selected,
        onFocus: () => {
            panel.normalizeCurrentPanel();
        },
        controls: [
            !disabled && onSelect && getSelectControl({
                label: t('action.select'),
                action: () => {
                    return onSelect();
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

    const title = [ id, path ].filter(Boolean).join('\n');

    return <Group w={gameExpandedConstants.width} gap='xs' align='flex-start' wrap='nowrap'>

        <Stack gap='xs'>
            <Image
                src={imgSrc}
                className={classes.icon}
                radius='md'
            />

            {!loading && <>

                {editDropdown && <UIPopover
                    position='right'
                    dropdown={editDropdown}
                >
                    <WithControlsIcons placement='out' icons={controlIcons('edit')}>
                        <Button
                            variant='filled'
                            color='blue'
                            size='compact-xs'
                            fullWidth
                            {...controlProps('edit')}
                        >
                            <Group wrap='nowrap' gap='sm'>
                                {hasDuplicates && <CopyIcon color='var(--mantine-color-yellow-4)' />}
                                <PenIcon />
                            </Group>
                        </Button>
                    </WithControlsIcons>
                </UIPopover>}

                {actions}
            </>}
        </Stack>

        <WithControlsIcons placement='out' icons={controlIcons('open')} miw={0} style={{ flexGrow: 1 }}>
            <Button
                className={clsx(classes.button, selected && classes.selected)}
                variant='default'
                loading={loading}
                {...focusProps}
                {...controlProps('open')}
                title={title}
            >
                <Stack w='100%' align='stretch' gap={0}>
                    <Text>
                        {label}{hasDuplicates && <UIPokedexIcons.Duplicate size='xs' ml='md' style={{ verticalAlign: 'middle' }} />}
                    </Text>

                    <Divider my='xs' />

                    {secondaryLine && <Text>
                        {secondaryLine}
                    </Text>}

                    {tertiaryLine && <Group
                        component={Text}
                        wrap='nowrap'
                        mx='auto'
                        style={{
                            textWrap: 'nowrap',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {tertiaryLine}
                    </Group>}

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

                    {missingFile && <Group
                        component={Text}
                        gap='sm'
                        wrap='nowrap'
                        mx='auto'
                        style={{
                            textWrap: 'nowrap',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        <UIIconWrapper variant='transparent' color='red'>
                            <FileXIcon />
                        </UIIconWrapper>
                        File is missing
                    </Group>}

                    <Divider my='xs' />

                    <Text size='sm'>
                        <UIPathLine
                            style={{ maxWidth: 200, justifyContent: 'flex-end' }}
                        >{path}</UIPathLine>
                    </Text>
                </Stack>
            </Button>
        </WithControlsIcons>
    </Group>;
};
