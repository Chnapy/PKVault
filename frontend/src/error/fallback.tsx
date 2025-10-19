import { type FallbackProps } from 'react-error-boundary';
import { Button } from '../ui/button/button';
import { Container } from '../ui/container/container';
import { Icon } from '../ui/icon/icon';
import { theme } from '../ui/theme';

export type FallbackExtraProps = {
    onClose?: () => void;
};

export const Fallback = {
    'default': ({ error, onClose }: FallbackProps & FallbackExtraProps) => {

        return <Container
            style={{
                backgroundColor: theme.bg.red,
                color: theme.text.light,
                padding: 8,
                paddingBottom: 0,
            }}
        >
            {onClose && <Button
                style={{ float: 'right' }}
                onClick={onClose}>
                <Icon name='times' forButton />
            </Button>}

            <div
                style={{
                    textAlign: 'center',
                    whiteSpace: 'break-spaces',
                }}
            >
                <Icon name='exclamation-triangle' />{' '}
                Woop woop an error happened !<br />
                Please report these next logs to <a
                    href="https://projectpokemon.org/home/forums/topic/67239-pkvault-centralized-pkm-storage-management-pokedex-app"
                    target="_blank"
                    style={{ color: theme.text.primaryLight, whiteSpace: 'nowrap' }}
                >projectforum discussion</a>.
            </div>

            <pre
                style={{
                    width: '100%',
                    maxHeight: 400,
                    overflow: 'auto',
                    padding: 8,
                    margin: 0,
                    marginTop: 8,
                    fontSize: 12,
                    backgroundColor: 'rgba(0, 0, 0, .25)',
                }}
            >
                ErrorType={error?.constructor?.name}<br />
                {error instanceof Error
                    ? error.stack
                    : error + ''}
            </pre>
        </Container>;
    },
    'item': ({ error, onClose }: FallbackProps & FallbackExtraProps) => {

        return <Container
            style={{
                backgroundColor: theme.bg.red,
                color: theme.text.light,
                width: 98,
                height: 98,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'not-allowed'
            }}
        >
            {onClose && <Button
                style={{ float: 'right' }}
                onClick={onClose}>
                <Icon name='times' forButton />
            </Button>}

            <div
                style={{
                    textAlign: 'center',
                    whiteSpace: 'break-spaces',
                }}
            >
                <Icon name='exclamation-triangle' /><br />
                {error?.constructor?.name ?? 'Error'} !
            </div>
        </Container>;
    },
};
