import type React from 'react';
import { GameVersion } from '../../data/sdk/model';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { Button, type ButtonProps } from '../button/button';
import { Icon } from '../icon/icon';
import { theme } from '../theme';

export type DetailsTabProps = {
    isEnabled?: boolean;
    version: GameVersion | null;    // null means pkvault
    otName: string;
    original?: boolean;
    warning?: boolean;
} & ButtonProps;

export const DetailsTab: React.FC<DetailsTabProps> = ({ isEnabled = true, version, otName, original, warning, disabled, ...rest }) => {
    const gameInfos = getGameInfos(version, isEnabled);

    return <Button
        bgColor={gameInfos.color}
        {...rest}
        style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottom: 'none',
            ...disabled ? {
                backgroundColor: gameInfos.color,
                pointerEvents: 'none',
            } : undefined,
            ...rest.style,
        }}
    >
        <img
            src={gameInfos.img}
            style={{
                height: '1lh',
                width: '1lh',
            }}
        />
        {otName} {original && " (original)"} {warning && isEnabled && <div style={{
            width: '1lh',
            borderRadius: 99,
            color: theme.text.light,
            backgroundColor: theme.bg.yellow,
        }}>
            <Icon name='exclaimation' forButton />
        </div>}

        {!isEnabled && <span style={{ display: 'flex', color: theme.text.red }}>
            <Icon name='folder' solid forButton />
            <Icon name='exclaimation' solid forButton />
        </span>}
    </Button>;
};
