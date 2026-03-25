import type React from 'react';
import type { EntityContext } from '../../data/sdk/model';
import { Icon } from '../icon/icon';
import { theme } from '../theme';
import { ItemImg } from './item-img';
import { SpeciesImg } from './species-img';
import { css } from '@emotion/css';

export type DetailsMainImgProps = {
    species: number;
    context: EntityContext;
    form: number;
    isFemale?: boolean;
    isShiny?: boolean;
    isEgg?: boolean;
    isShadow?: boolean;
    isOwned?: boolean;
    ball?: number;
    shinyPart: React.ReactNode;
    genderPart: React.ReactNode;
};

export const DetailsMainImg: React.FC<DetailsMainImgProps> = ({ species, context, form, isFemale, isShiny, isEgg, isShadow, isOwned, ball = 0, shinyPart, genderPart }) => {
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
            {ball > 0 && <ItemImg item={ball} className={css({
                width: 20,
                height: 20,
                overflow: 'hidden'
            })} />}

            {isOwned && <Icon name='folder' solid />}
        </div>

        <div
            className={css({
                position: 'absolute',
                top: 4,
                right: 4,
            })}
        >
            {shinyPart}
        </div>

        <div
            className={css({
                position: 'absolute',
                bottom: 4,
                right: 4,
            })}
        >
            {genderPart}
        </div>
    </>;
};
