import { css } from '@emotion/css';
import type React from 'react';
import { Button } from '../button/button';
import { ButtonSticker } from '../button/button-sticker';
import { Icon } from '../icon/icon';
import type { DetailsExpandedState } from './details-card-container';

export type DetailsCardHeaderProps = {
    title: React.ReactNode;
    expanded: DetailsExpandedState;
    setExpanded: ((state: DetailsExpandedState) => void) | undefined;
    onClose: () => void;
};

export const DetailsCardHeader: React.FC<DetailsCardHeaderProps> = ({ title, expanded, setExpanded, onClose }) => (
    <div
        className={css({
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            paddingLeft: 4,
            paddingRight: 4,
        })}
    >
        <div className={css({
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
        })}>
            {title}
        </div>

        <ButtonSticker>
            <Button
                onClick={setExpanded
                    && (() => setExpanded(expanded !== 'expanded-max' ? 'expanded-max' : 'none'))}
                disabled={!setExpanded}
                selected={expanded === 'expanded-max'}
            >
                <Icon name={'expand'} forButton />
            </Button>

            <Button
                onClick={setExpanded
                    && (() => setExpanded(expanded !== 'expanded' ? 'expanded' : 'none'))}
                disabled={!setExpanded}
                selected={expanded === 'expanded'}
                className={css({ minWidth: '2lh' })}
            >
                <Icon name={expanded === 'expanded' ? 'angle-down' : 'angle-up'} forButton />
            </Button>
        </ButtonSticker>

        <Button onClick={onClose}>
            <Icon name='times' forButton />
        </Button>
    </div>
);