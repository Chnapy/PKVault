import type React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { css } from '@emotion/css';

export type DetailsTitleProps = {
    contextVersion: GameVersion | null;    // null means pkvault
    generation?: number;
    showVersionName?: boolean;
};

export const DetailsTitle: React.FC<React.PropsWithChildren<DetailsTitleProps>> = ({ contextVersion, generation, showVersionName, children }) => {
    const staticData = useStaticData();

    if (!generation && contextVersion) {
        generation = staticData.versions[ contextVersion ]?.generation;
    }

    return <>
        <img
            src={getGameInfos(contextVersion).img}
            className={css({ height: 28, width: 28 })}
        />

        <div className={css({ flexGrow: 1 })}>
            {generation ? <>G{generation}</> : null}
            {showVersionName && <>
                {' / '}
                {contextVersion
                    ? <>
                        {staticData.versions[ contextVersion ]?.name}
                    </>
                    : 'PKVault'}
            </>}
        </div>

        {children}
    </>;
};
