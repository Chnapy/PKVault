import type React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { theme } from '../theme';
import { css } from '@emotion/css';

type GameImgProps = {
    version: GameVersion | null;
    size?: number | string;
    borderRadius?: number;
    borderWidth?: number;
};

export const GameImg: React.FC<GameImgProps> = ({ version, size, borderRadius, borderWidth = 0 }) => {
    const gameInfos = getGameInfos(version);

    return <img
        src={gameInfos.img}
        alt={"version-" + version}
        className={css({
            imageRendering: version !== null && typeof size === 'number' && (size % 64) === 0 ? "pixelated" : undefined,
            height: size,
            display: "inline-block",
            backgroundColor: version !== null ? theme.bg.default : undefined,
            borderColor: theme.bg.dark,
            borderStyle: 'solid',
            borderRadius,
            borderWidth,
            boxSizing: 'content-box',
            verticalAlign: 'middle',
        })}
    />;
};
