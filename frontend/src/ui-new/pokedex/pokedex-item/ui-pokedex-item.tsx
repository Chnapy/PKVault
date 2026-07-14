import { Badge, Box, Button, Group, Tooltip } from '@mantine/core';
import type React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { UISpeciesImgSkeleton } from '../../sprite-img/species-img/ui-species-img-skeleton';
import { useVisibilityContext } from '../../visibility/visibility-context';
import classes from './ui-pokedex-item.module.css';

export type UIPokedexItemProps = {
    id: string;
    // context: EntityContext;
    species: number;
    form?: string;
    label: string;
    selected?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
};

export const UIPokedexItem: React.FC<UIPokedexItemProps> = props => {
    const visible = useVisibilityContext() ?? true;

    return visible
        ? <UIPokedexItemInner {...props} />
        : <UISpeciesImgSkeleton />;
};

const UIPokedexItemInner: React.FC<UIPokedexItemProps> = ({
    id, species, form,
    label, selected, onClick, children
}) => {
    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: id,
        controls: [
            onClick && getSelectControl({
                label: 'Open',
                action: e => {
                    onClick();
                },
            }),
        ],
    });

    return <WithControlsIcons placement='out' icons={controlIcons('open')}
        className={classes.uiPokedexItem}
    >
        <Tooltip label={label} withArrow position="bottom" disabled={!onClick}>
            <Button
                {...focusProps}
                {...controlProps('open')}
                data-selected={selected || undefined}
                variant='default'
                className={classes.button}
                bd='none'
                maw='100%'
            >
                <Group gap='sm' wrap='wrap'>
                    {children}
                </Group>

                <Box className={classes.species} p='xs' fz='md'>
                    #{species}
                </Box>
                {form && <Box pos='absolute' bottom={0} left={0}>
                    <Badge variant='transparent' color="blue" size="sm" radius="sm">{form}</Badge>
                </Box>}
            </Button>
        </Tooltip>
    </WithControlsIcons>;
};
