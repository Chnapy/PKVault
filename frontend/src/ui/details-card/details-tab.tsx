import { css, cx } from '@emotion/css';
import type React from 'react';
import { GameVersion } from '../../data/sdk/model';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { Button, type ButtonProps } from '../button/button';
import { Icon } from '../icon/icon';
import { GameImg } from '../img/game-img';
import { theme } from '../theme';

export type DetailsTabProps = {
    isEnabled?: boolean;
    contextVersion: GameVersion | null;    // null means pkvault
    otName: string;
    original?: boolean;
    warning?: boolean;
} & ButtonProps;

export const DetailsTab: React.FC<DetailsTabProps> = ({ isEnabled = true, contextVersion, otName, original, warning, disabled, ...rest }) => {
    const gameInfos = getGameInfos(contextVersion, isEnabled);

    return <Button
        bgColor={gameInfos.color}
        {...rest}
        className={cx(css({
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottom: 'none',
            ...disabled ? {
                backgroundColor: gameInfos.color,
                pointerEvents: 'none',
            } : undefined,
        }), rest.className)}
    >
        <GameImg version={contextVersion} size='1lh' />
        <span className={cx({
            [ css({ borderBottom: '1px solid currentColor' }) ]: original
        })}>{otName}</span> {warning && isEnabled && <div className={css({
            width: '1lh',
            borderRadius: 99,
            color: theme.text.light,
            backgroundColor: theme.bg.yellow,
        })}>
            <Icon name='exclaimation' forButton />
        </div>}

        {!isEnabled && <span className={css({ display: 'flex', color: theme.text.red })}>
            <Icon name='folder' solid forButton />
            <Icon name='exclaimation' solid forButton />
        </span>}
    </Button>;
};
