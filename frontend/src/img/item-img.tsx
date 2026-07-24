import type React from 'react';
import { getApiFullUrl } from '../data/mutator/custom-instance';
import type { GameVersion } from '../data/sdk/model';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { getStaticDataGetSpritesheetImgUrl } from '../data/sdk/static-data/static-data.gen';
import { useStaticData } from '../hooks/use-static-data';
import { UIItemImg } from '../ui/sprite-img/item-img/ui-item-img';
import { type SpriteImgProps } from './sprite-img';

export type ItemImgProps = {
    item: number | string;  // value or id
    version: GameVersion;
} & Omit<SpriteImgProps, 'spriteInfos'>;

export const ItemImg: React.FC<ItemImgProps> = ({ item, version, ...imgProps }) => {
    const staticData = useStaticData();
    const settings = useSettingsGet();

    let staticForm = staticData.getItem(version, item);;

    if (!staticForm?.sprite) {
        console.log('UNKNOWN ITEM SPRITE -', item);
        staticForm = staticData.itemUnknown;    // gives "?" sprite
    }

    const spriteKey = staticForm.sprite;
    const spriteInfos = staticData.spritesheets.items[ spriteKey ];

    const sheetRelativeUrl = spriteInfos && getStaticDataGetSpritesheetImgUrl(spriteInfos.sheetName, {
        buildID: settings.data?.data.buildID,
    });
    const sheetUrl = getApiFullUrl(sheetRelativeUrl ?? '');

    return spriteInfos && <UIItemImg
        sheetUrl={sheetUrl}
        spriteInfos={spriteInfos}
        item={item}
        {...imgProps}
    />;
};
