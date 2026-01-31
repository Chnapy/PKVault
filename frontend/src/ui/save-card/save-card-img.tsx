import type React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { theme } from '../theme';
import { css } from '@emotion/css';

export const SaveCardImg: React.FC<{
    version: GameVersion;
    size?: number | string;
    borderWidth?: number;
}> = ({ version, size = 64, borderWidth = 4 }) => {
    const gameInfos = getGameInfos(version);

    return <img
        src={gameInfos.img}
        alt={"version-" + version}
        className={css({
            imageRendering: typeof size === 'number' && (size % 64) === 0 ? "pixelated" : undefined,
            height: size,
            display: "block",
            background: theme.bg.default,
            borderColor: theme.bg.dark,
            borderStyle: 'solid',
            borderWidth: borderWidth,
            borderRadius: typeof size === 'number' ? ~~(size / 8) : 8,
            boxSizing: 'content-box',
        })}
    />;
};
