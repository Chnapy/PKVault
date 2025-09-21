import { css } from '@emotion/css';
import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { theme } from '../theme';

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
                alt={staticData.species[ species ].name}
                className={css({
                    imageRendering: "pixelated",
                    width: 96,
                    height: 96,
                    display: "block",
                    filter: isShadow ? 'drop-shadow(#770044 0px 0px 6px)' : undefined,
                })}
            />
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
                src={staticData.items[ ball ].sprite}
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
