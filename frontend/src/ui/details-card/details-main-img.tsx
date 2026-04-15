import { css } from '@emotion/css';
import type React from 'react';
import { Gender as GenderType, type EntityContext } from '../../data/sdk/model';
import { Gender } from '../gender/gender';
import { AlphaIcon } from '../icon/alpha-icon';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { BallImg } from '../img/ball-img';
import { SpeciesImg } from '../img/species-img';
import { theme } from '../theme';
import type { ItemImgProps } from '../img/item-img';

export type DetailsMainImgProps = {
    species: number;
    context: EntityContext;
    form: number;
    gender: GenderType;
    isFemale?: boolean;
    isShiny?: boolean;
    isAlpha?: boolean;
    isEgg?: boolean;
    isShadow?: boolean;
    isOwned?: boolean;
    ball?: ItemImgProps[ 'item' ];
};

export const DetailsMainImg: React.FC<DetailsMainImgProps> = ({ species, context, form, gender, isFemale, isShiny, isAlpha, isEgg, isShadow, isOwned, ball = 0 }) => {
    return <>
        <div
            className={css({
                background: theme.bg.default,
                borderRadius: 8,
            })}
        >
            <SpeciesImg species={species} context={context} form={form} isFemale={isFemale} isShiny={isShiny} isEgg={isEgg} isShadow={isShadow} />
        </div>

        <div
            className={css({
                position: 'absolute',
                top: 4,
                left: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: theme.text.default
            })}
        >
            {ball ? <BallImg item={ball} /> : null}

            {isOwned && <Icon name='folder' solid />}
        </div>

        <div
            className={css({
                position: 'absolute',
                top: 4,
                right: 4,
            })}
        >
            {isAlpha && <AlphaIcon />}

            {isShiny && <ShinyIcon
                className={css({
                    margin: '0 -2px',
                })}
            />}
        </div>

        <div
            className={css({
                position: 'absolute',
                bottom: 4,
                right: 4,
            })}
        >
            <Gender gender={gender} />
        </div>
    </>;
};
