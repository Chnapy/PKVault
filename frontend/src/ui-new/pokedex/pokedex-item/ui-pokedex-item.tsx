import { Badge, Box, Button, Group, Stack, ThemeIcon, Tooltip } from '@mantine/core';
import { FolderIcon } from 'lucide-react';
import type React from 'react';
import type { Gender } from '../../../data/sdk/model';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIBallIcon } from '../../icon/ui-ball-icon';
import { UIGender } from '../../icon/ui-gender';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { usePopover } from '../../interaction/focus-controls/components/popover/hooks/use-popover';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import classes from './ui-pokedex-item.module.css';

export type UIPokedexItemProps = {
    id: string;
    // context: EntityContext;
    species: number;
    form?: string;
    genders: Gender[];

    isSeen: boolean;
    // isSeenShiny: boolean;
    isSeenAlpha?: boolean;
    isCaught?: boolean;
    isOwned?: boolean;
    isOwnedShiny?: boolean;

    label: string;
    children: React.ReactNode;
};

export const UIPokedexItem: React.FC<UIPokedexItemProps> = ({
    id, species, form, genders,
    isSeen, isSeenAlpha, isCaught, isOwned, isOwnedShiny,
    label, children
}) => {
    const setPopover = usePopover();

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: id,
        controls: [
            getSelectControl({
                label: 'Open',
                action: e => {
                    setPopover?.(s => ({
                        opened: !s.opened,
                    }));
                    // onClick?.(e);
                },
            }),
        ],
    });

    const wrapIcon = (icon: React.ReactNode) => <ThemeIcon variant='default' size='sm' opacity={0.75}>
        {icon}
    </ThemeIcon>;

    return <WithControlsIcons placement='out' icons={controlsIcons.open}
        className={classes.uiPokedexItem}
    >
        <Tooltip label={label} withArrow position="bottom">
            <Button
                {...focusControlProps}
                variant='light'
                className={classes.button}
                bd='none'
            >
                <Box
                    style={{
                        filter: isSeen
                            ? undefined
                            : 'brightness(0) opacity(0.4)',
                    }}
                >
                    {children}
                </Box>

                {/* <Box className={classes.icons}>
                    {icons}
                </Box> */}

                <Box className={classes.species} p='xs' fz='md'>
                    #{species}
                </Box>
                {form && <Box pos='absolute' bottom={0} left={0}>
                    <Badge variant='transparent' color="blue" size="sm" radius="sm">{form}</Badge>
                </Box>}
                <Group pos='absolute' top={0} right={0} gap='xs' p='sm'>
                    {isOwned && wrapIcon(<FolderIcon />)}

                    {isCaught && wrapIcon(<UIBallIcon />)}
                </Group>
                <Stack pos='absolute' bottom={0} right={0} gap='sm' p='sm'>
                    {isSeenAlpha && wrapIcon(<UIAlphaIcon />)}

                    {isOwnedShiny && wrapIcon(<UIShinyIcon />)}

                    <Group gap='xs'>
                        {genders.map(gender => <UIGender key={gender} gender={gender} size='small' />)}
                    </Group>
                </Stack>
            </Button>
        </Tooltip>
    </WithControlsIcons>;
};
