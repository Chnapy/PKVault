import type React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { css } from '@emotion/css';

export type DetailsTitleProps = {
    version: GameVersion | null;    // null means pkvault
    generation?: number;
    showVersionName?: boolean;
};

export const DetailsTitle: React.FC<React.PropsWithChildren<DetailsTitleProps>> = ({ version, generation, showVersionName, children }) => {
    const staticData = useStaticData();

    if (!generation && version) {
        generation = staticData.versions[ version ]?.generation;
    }

    return <>
        <img
            src={getGameInfos(version).img}
            className={css({ height: 28, width: 28 })}
        />

        <div className={css({ flexGrow: 1 })}>
            {generation ? <>G{generation}</> : null}
            {showVersionName && <>
                {' / '}
                {version
                    ? <>
                        {staticData.versions[ version ]?.name}
                    </>
                    : 'PKVault'}
            </>}
        </div>

        {children}
    </>;
};
