import { css } from '@emotion/css';
import type React from 'react';
import type { EntityContext, GameVersion } from '../../data/sdk/model';
import { getEntityContextGenerationName } from '../../data/util/get-entity-context-generation-name';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';

export type DetailsTitleProps = {
    context: EntityContext;
    contextVersion: GameVersion | null;    // null means pkvault
    showVersionName?: boolean;
};

export const DetailsTitle: React.FC<React.PropsWithChildren<DetailsTitleProps>> = ({ context, contextVersion, showVersionName, children }) => {
    const staticData = useStaticData();

    const contextGeneration = getEntityContextGenerationName(context, true);

    return <>
        <img
            src={getGameInfos(contextVersion).img}
            className={css({ height: 28, width: 28 })}
        />

        <div className={css({ flexGrow: 1 })}>
            {contextGeneration ? contextGeneration : null}
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
