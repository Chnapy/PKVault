import type React from 'react';
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import { useStaticData } from '../../hooks/use-static-data';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { theme } from '../theme';
import { SpeciesImg } from './species-img';

export type DetailsMainImgProps = {
    species: number;
    isShiny?: boolean;
    isEgg?: boolean;
    isShadow?: boolean;
    isOwned?: boolean;
    ball?: number;
};

export const DetailsMainImg: React.FC<DetailsMainImgProps> = ({ species, isShiny, isEgg, isShadow, isOwned, ball = 0 }) => {
    const staticData = useStaticData();

    return <>
        <div
            style={{
                background: theme.bg.default,
                borderRadius: 8,
            }}
        >
            <SpeciesImg species={species} isShiny={isShiny} isEgg={isEgg} isShadow={isShadow} />
        </div>

        <div
            style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                // gap: 4,
                color: theme.text.default
            }}
        >
            {isOwned && <Icon name='folder' solid />}

            {ball > 0 && <img
                src={getApiFullUrl(staticData.items[ ball ].sprite)}
                style={{
                    width: 30,
                    height: 30,
                }}
            />}
        </div>

        {isShiny && <ShinyIcon
            style={{
                position: 'absolute',
                top: 8,
                right: 8,
                // width: 12,
                margin: '0 -2px',
            }}
        />}
    </>;
};
