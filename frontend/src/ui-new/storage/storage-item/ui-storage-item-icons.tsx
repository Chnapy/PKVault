import { Box, Group, Stack } from '@mantine/core';
import { CopyIcon, ExternalLinkIcon, FileXIcon, HeartIcon, LinkIcon, SparklesIcon } from 'lucide-react';
import type React from 'react';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIIconWrapper } from '../../icon/ui-icon-wrapper';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { UIPokedexIcons } from '../../pokedex/icons/ui-pokedex-icons';
import { UIDetailsLevel } from '../storage-details/ui-details-level';
import classes from './ui-storage-item-icons.module.css';

export type UIStorageItemIconsProps = {
    heldItem?: React.ReactNode;
    isStarter?: boolean;
    party?: number;
    isAlpha?: boolean;
    isShiny?: boolean;
    level?: number;
    nbrVariants?: number;
    hasDisabledVariant?: boolean;
    isExternal?: boolean;
    canEvolve?: boolean;
    attached?: boolean;
    needSynchronize?: boolean;
    isDuplicate?: boolean;
    warning?: boolean;
};

export const UIStorageItemIcons: React.FC<UIStorageItemIconsProps> = ({
    heldItem, isStarter, isAlpha, isShiny, level, party, nbrVariants = 0,
    hasDisabledVariant, isExternal, canEvolve, attached, needSynchronize,
    isDuplicate, warning,
}) => {
    return <Box className={classes.uiStorageItemIcons}>
        {heldItem && <Box pos='absolute' left={0} bottom={0}>
            {heldItem}
        </Box>}

        <Stack pos='absolute' bottom={4} right={4} align='flex-end' gap={2}>
            {isStarter && <UIIconWrapper variant='filled' color='red'>
                <HeartIcon />
            </UIIconWrapper>}

            {party !== undefined && <UIIconWrapper variant='filled' color='green'>
                {party}
            </UIIconWrapper>}

            {hasDisabledVariant || nbrVariants > 1 || isExternal
                ? <Group gap='sm' wrap='nowrap'>
                    {level !== undefined && <UIDetailsLevel level={level} />}
                    {hasDisabledVariant && <UIIconWrapper variant='transparent' color='red'>
                        <FileXIcon />
                    </UIIconWrapper>}
                    {nbrVariants > 1 && <UIIconWrapper variant='filled' color='dark'>
                        {nbrVariants}
                    </UIIconWrapper>}
                    {isExternal && <UIIconWrapper variant='filled' color='dark'>
                        <ExternalLinkIcon />
                    </UIIconWrapper>}
                </Group>
                : null}
        </Stack>

        <Group pos='absolute' top={4} right={4} justify='flex-end' gap={2}>
            {isAlpha && <UIIconWrapper variant='transparent'>
                <UIAlphaIcon />
            </UIIconWrapper>}

            {isShiny && <UIIconWrapper variant='transparent'>
                <UIShinyIcon />
            </UIIconWrapper>}

            {/* {!canMoveOutside && renderBubble(theme.bg.red, <Icon name='logout' solid forButton />)} */}

            {canEvolve && <UIIconWrapper variant='transparent' color='blue'>
                <SparklesIcon />
            </UIIconWrapper>}

            {attached && <UIIconWrapper variant='transparent' color={needSynchronize ? 'yellow' : undefined}>
                <LinkIcon />
            </UIIconWrapper>}

            {/* {canCreateVariant && renderBubble(theme.bg.primary, <Icon name='plus' solid forButton />)} */}

            {isDuplicate && <UIIconWrapper variant='transparent' color='yellow'>
                <CopyIcon />
            </UIIconWrapper>}

            {warning && <UIPokedexIcons.Warn size='sm' />}
        </Group>
    </Box>;
};
