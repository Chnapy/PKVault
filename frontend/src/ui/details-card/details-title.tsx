import type React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';

export type DetailsTitleProps = {
    version: GameVersion;
    showVersionName?: boolean;
};

export const DetailsTitle: React.FC<React.PropsWithChildren<DetailsTitleProps>> = ({ version, showVersionName, children }) => {
    const staticData = useStaticData();

    const generation = staticData.versions[ version ]?.generation;

    return <>
        <img
            src={getGameInfos(version).img}
            style={{ height: 28, width: 28 }}
        />

        <div style={{ flexGrow: 1 }}>
            G{generation}{showVersionName && ` / ${staticData.versions[ version ]?.name}`}
        </div>

        {children}
    </>;
};
