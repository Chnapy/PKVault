import { clsx } from 'clsx';
import type React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import classes from './ui-game-img.module.css';

type UIGameImgProps = {
    version: GameVersion | null;
    name?: string;
    size?: '1lh';
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const UIGameImg: React.FC<UIGameImgProps> = ({ version, name, size, ...rest }) => {
    const gameInfos = getGameInfos(version);

    return <img
        src={gameInfos.img}
        alt={"version-" + version}
        title={name}
        className={clsx(
            classes.uiGameImg,
            version !== null && classes.save,
        )}
        style={{
            imageRendering: version !== null && typeof size === 'number' && (size % 64) === 0 ? "pixelated" : undefined,
            height: size,
        }}
        {...rest}
    />;
};
