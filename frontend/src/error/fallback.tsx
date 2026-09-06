import { Alert, Anchor, Box, Code, Container, Stack } from '@mantine/core';
import { AlertTriangleIcon, XIcon } from 'lucide-react';
import { type FallbackProps } from 'react-error-boundary';
import { UIActionIcon } from '../ui/form/button/ui-action-icon';

export type FallbackExtraProps = {
    className?: string;
    onClose?: () => void;
};

export const Fallback = {
    'default': ({ error, className, onClose }: FallbackProps & FallbackExtraProps) => {

        return <Container
            fluid
            bg='red'
            c='white'
            p='md'
            bdrs='sm'
            className={className}
        >
            {onClose && <UIActionIcon
                name='close'
                controlLabel='Close'
                onClick={onClose}
                style={{ float: 'right' }}
            >
                <XIcon />
            </UIActionIcon>}

            <Alert variant='filled' color='red' icon={<AlertTriangleIcon />} title='An error happened !'>
                Please report these next logs to <Anchor
                    c='blue.2'
                    href="https://github.com/Chnapy/PKVault/issues"
                    target="_blank"
                >GitHub</Anchor> or <Anchor
                    c='blue.2'
                    href="https://projectpokemon.org/home/forums/topic/67239-pkvault-centralized-pkm-storage-management-pokedex-app"
                    target="_blank"
                >Project Pokémon discussion</Anchor>.<br />
                Also consider sharing files from folder <Code color='red.7'>logs</Code>.
            </Alert>

            <Code
                block
                color='red.7'
                p='sm'
                mah={400}
            >
                ErrorType={error?.constructor?.name}<br />
                {error instanceof Error
                    ? error.stack
                    : error + ''}
            </Code>
        </Container>;
    },
    'item': ({ error, className, onClose }: FallbackProps & FallbackExtraProps) => {
        return <Stack
            bg='red'
            c='white'
            p='md'
            bdrs='sm'
            w={'calc(var(--sprite-species-size-multiplier, 1) * 96px)'}
            h={'calc(var(--sprite-species-size-multiplier, 1) * 96px)'}
            align='center'
            gap='xs'
            className={className}
            style={{
                overflow: 'hidden',
                cursor: 'not-allowed'
            }}
        >
            {onClose && <UIActionIcon
                name='close'
                controlLabel='Close'
                onClick={onClose}
                size='sm'
                style={{ alignSelf: 'flex-end' }}
            >
                <XIcon />
            </UIActionIcon>}

            <AlertTriangleIcon />

            <Box>
                {error?.constructor?.name ?? 'Error'}
            </Box>
        </Stack>;
    },
};
