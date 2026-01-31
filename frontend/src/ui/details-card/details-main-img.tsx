import type React from 'react';
import type { EntityContext } from '../../data/sdk/model';
import { Icon } from '../icon/icon';
import { theme } from '../theme';
import { ItemImg } from './item-img';
import { SpeciesImg } from './species-img';

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
            style={{
                background: theme.bg.default,
                borderRadius: 8,
            }}
        >
            <SpeciesImg species={species} context={context} form={form} isFemale={isFemale} isShiny={isShiny} isEgg={isEgg} isShadow={isShadow} />
        </div>

        <div
            style={{
                position: 'absolute',
                top: 2,
                left: 2,
                display: 'flex',
                alignItems: 'center',
                color: theme.text.default
            }}
        >
            {ball > 0 && <ItemImg item={ball} />}

            {isOwned && <Icon name='folder' solid />}
        </div>

        <div
            style={{
                position: 'absolute',
                top: 8,
                right: 8,
            }}
        >
            {shinyPart}
        </div>

        <div
            style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
            }}
        >
            {genderPart}
        </div>
    </>;
};
