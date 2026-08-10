import { Badge, Box, Button, Group, Tooltip } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import classes from './ui-pokedex-item.module.css';

export type UIPokedexItemRawProps = {
    ref?: React.Ref<HTMLDivElement>;
    id: string;
    // context: EntityContext;
    species: number;
    form?: string;
    label: string;
    selected?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
};

export const UIPokedexItemRaw: React.FC<UIPokedexItemRawProps> = ({
    ref: refRoot, id, species, form,
    label, selected, onClick, children
}) => {
    const { t } = useTranslate();

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: id,
        controls: [
            onClick && getSelectControl({
                label: t('action.open'),
                action: e => {
                    onClick();
                },
            }),
        ],
    });

    const ref = useMergedRef(
        refRoot,
        focusProps.ref,
        controlProps('open').ref,
    );

    return <WithControlsIcons placement='out' icons={controlIcons('open')}
        className={classes.uiPokedexItem}
    >
        <Tooltip label={label} withArrow position="bottom" disabled={!onClick}>
            <Button
                {...focusProps}
                {...controlProps('open')}
                ref={ref}
                data-dex-item
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
