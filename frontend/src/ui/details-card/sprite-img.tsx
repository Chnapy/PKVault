import { css, cx } from '@emotion/css';
import type React from 'react';
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { getStaticDataGetSpritesheetImgUrl } from '../../data/sdk/static-data/static-data.gen';
import type { SpriteInfo } from '../../data/sdk/model';

export type SpriteImgProps = {
    spriteInfos: SpriteInfo;
    size?: number | '1lh';
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const SpriteImg: React.FC<SpriteImgProps> = ({ spriteInfos, size, ...imgProps }) => {
    const settings = useSettingsGet();

    const sheetRelativeUrl = spriteInfos && getStaticDataGetSpritesheetImgUrl(spriteInfos.sheetName, {
        buildID: settings.data?.data.buildID,
    });
    const sheetUrl = getApiFullUrl(sheetRelativeUrl ?? '');

    size = size === '1lh' ? 19 : size;

    const scale = size && spriteInfos ? (size / spriteInfos.height) : 1;

    return <div
        {...imgProps}
        className={cx(css({
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            verticalAlign: 'sub',
            height: size,
            width: size,
            overflow: 'hidden',
        }), imgProps.className)}
    >
        <img
            src={sheetUrl}
            alt={`${spriteInfos.sheetName}-x=${spriteInfos.x}-y=${spriteInfos.y}`}
            className={css({
                objectFit: 'none',
                objectPosition: spriteInfos && `-${spriteInfos.x}px -${spriteInfos.y}px`,
                imageRendering: scale === 1 ? "pixelated" : undefined,
                height: spriteInfos && spriteInfos.height,
                width: spriteInfos && spriteInfos.width,
                transform: `${scale !== 1 ? `scale(${scale})` : ''}`,
                // transformOrigin: 'center center',
            })}
        />
    </div>;
};
