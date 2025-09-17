import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { ShinyIcon } from '../icon/shiny-icon';
import { theme } from '../theme';

export type StorageDetailsMainImgProps = {
    species: number;
    speciesName: string;
    isShiny: boolean;
    isEgg: boolean;
    isShadow?: boolean;
    ball: number;
};

export const StorageDetailsMainImg: React.FC<StorageDetailsMainImgProps> = ({ species, speciesName, isShiny, isEgg, isShadow, ball }) => {
    const staticData = useStaticData();

    const sprite = isEgg
        ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png'
        : (isShiny
            ? staticData.species[ species ].spriteShiny
            : staticData.species[ species ].spriteDefault);

    return <>
        <div
            style={{
                background: theme.bg.default,
                borderRadius: 8,
            }}
        >
            <img
                src={sprite}
                alt={speciesName}
                style={{
                    imageRendering: "pixelated",
                    width: 96,
                    height: 96,
                    display: "block",
                    filter: isShadow ? 'drop-shadow(#770044 0px 0px 6px)' : undefined,
                }}
            />
        </div>

        {ball > 0 && <img
            src={staticData.items[ ball ].sprite}
            style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 30,
                height: 30,
            }}
        />}

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
