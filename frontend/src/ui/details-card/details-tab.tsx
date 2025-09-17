import type React from 'react';
import { GameVersion } from '../../data/sdk/model';
import { Button, type ButtonProps } from '../button/button';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';

export type DetailsTabProps = {
    version: GameVersion;
    otName: string;
    original?: boolean;
} & ButtonProps;

export const DetailsTab: React.FC<DetailsTabProps> = ({ version, otName, original, disabled, ...rest }) => {
    const gameInfos = getGameInfos(version);

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
            style={{ height: '1lh' }}
        />
        {otName} {original && " (original)"}
    </Button>;
};
