import type React from 'react';
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import { EntityContext } from '../../data/sdk/model';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { getStaticDataGetSpritesheetImgUrl } from '../../data/sdk/static-data/static-data.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { UISpeciesImg } from '../../ui-new/sprite-img/species-img/ui-species-img';
import { type SpriteImgProps } from './sprite-img';

export type SpeciesImgProps = {
    species: number;
    context: EntityContext;
    form: number;
    isFemale?: boolean;
    isShiny?: boolean;
    isEgg?: boolean;
    isShadow?: boolean;
} & Omit<SpriteImgProps, 'spriteInfos' | 'size'>;

export const SpeciesImg: React.FC<SpeciesImgProps> = ({ species, context, form, isFemale, isShiny, isEgg, isShadow, ...imgProps }) => {
    const staticData = useStaticData();
    const settings = useSettingsGet();

    if (species === 0)
        species = 1;

    const staticForms = staticData.species[ species ]?.forms[ context ];

    if (!staticForms?.[ form ])
        console.log('UNKNOWN FORM -', species, context, form);

    const staticForm = staticForms?.[ form ] ?? staticForms?.[ 0 ];
    if (!staticForm)
        return null;

    const { spriteDefault, spriteFemale, spriteShiny, spriteShinyFemale, spriteShadow } = staticForm;

    const getSpriteUrl = (): string | null => {
        if (isEgg) {
            return staticData.eggSprite;
        }

        if (isShadow && spriteShadow) {
            return spriteShadow;
        }

        if (isShiny) {
            return isFemale ? spriteShinyFemale ?? spriteShiny : spriteShiny;
        }

        return isFemale ? spriteFemale ?? spriteDefault : spriteDefault;
    };

    const spriteKey = getSpriteUrl();
    const spriteInfos = typeof spriteKey === 'string' ? staticData.spritesheets.species[ spriteKey ] : undefined;
    if (!spriteInfos)
        console.log('No sprite -', staticForm.name, species, context, form, staticForms);

    const sheetRelativeUrl = spriteInfos && getStaticDataGetSpritesheetImgUrl(spriteInfos.sheetName, {
        buildID: settings.data?.data.buildID,
    });
    const sheetUrl = getApiFullUrl(sheetRelativeUrl ?? '');

    return spriteInfos && <UISpeciesImg
        sheetUrl={sheetUrl}
        spriteInfos={spriteInfos}
        species={species}
        {...imgProps}
    />;
};
