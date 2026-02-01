import { css, cx } from '@emotion/css';
import { type FallbackProps } from 'react-error-boundary';
import { Button } from '../ui/button/button';
import { Container } from '../ui/container/container';
import { Icon } from '../ui/icon/icon';
import { theme } from '../ui/theme';

export type FallbackExtraProps = {
    className?: string;
    onClose?: () => void;
};

export const Fallback = {
    'default': ({ error, className, onClose }: FallbackProps & FallbackExtraProps) => {

        return <Container
            className={cx(css({
                backgroundColor: theme.bg.red,
                color: theme.text.light,
                padding: 8,
                paddingBottom: 0,
            }), className)}
        >
            {onClose && <Button
                className={css({ float: 'right' })}
                onClick={onClose}>
                <Icon name='times' forButton />
            </Button>}

            <div
                className={css({
                    textAlign: 'center',
                    whiteSpace: 'break-spaces',
                })}
            >
                <Icon name='exclamation-triangle' />{' '}
                Woop woop an error happened !<br />
                Please report these next logs to <a
                    href="https://projectpokemon.org/home/forums/topic/67239-pkvault-centralized-pkm-storage-management-pokedex-app"
                    target="_blank"
                    className={css({ color: theme.text.primaryLight, whiteSpace: 'nowrap' })}
                >projectpokemon discussion</a>.<br />
                Also consider sharing files from folder `logs`.
            </div>

            <pre
                className={css({
                    width: '100%',
                    maxHeight: 400,
                    overflow: 'auto',
                    padding: 8,
                    margin: 0,
                    marginTop: 8,
                    fontSize: 12,
                    backgroundColor: 'rgba(0, 0, 0, .25)',
                    whiteSpace: 'pre-wrap',
                })}
            >
                ErrorType={error?.constructor?.name}<br />
                {error instanceof Error
                    ? error.stack
                    : error + ''}
            </pre>
        </Container>;
    },
    'item': ({ error, className, onClose }: FallbackProps & FallbackExtraProps) => {

        return <Container
            className={cx(css({
                backgroundColor: theme.bg.red,
                color: theme.text.light,
                width: 98,
                height: 98,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'not-allowed'
            }), className)}
        >
            {onClose && <Button
                className={css({ float: 'right' })}
                onClick={onClose}>
                <Icon name='times' forButton />
            </Button>}

            <div
                className={css({
                    textAlign: 'center',
                    whiteSpace: 'break-spaces',
                })}
            >
                <Icon name='exclamation-triangle' /><br />
                {error?.constructor?.name ?? 'Error'} !
            </div>
        </Container>;
    },
};
