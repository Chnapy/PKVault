import { css } from '@emotion/css';
import type React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { theme } from '../theme';

type GameImgProps = {
    version: GameVersion | null;
    size?: number | string;
    borderRadius?: number;
    borderWidth?: number;
    showTitle?: boolean;
};

export const GameImg: React.FC<GameImgProps> = ({ version, size, borderRadius, borderWidth = 0, showTitle = true }) => {
    const gameInfos = getGameInfos(version);

    const staticVersions = useStaticData().versions;

    const name = version === null
        ? 'PKVault'
        : staticVersions[ version ]?.name;

    return <img
        src={gameInfos.img}
        alt={"version-" + version}
        title={showTitle ? name : undefined}
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
