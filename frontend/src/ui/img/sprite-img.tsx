import { css, cx } from '@emotion/css';
import type React from 'react';
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { getStaticDataGetSpritesheetImgUrl } from '../../data/sdk/static-data/static-data.gen';
import type { SpriteInfo } from '../../data/sdk/model';

export type SpriteImgProps = {
    spriteInfos: SpriteInfo;
    size?: number | '1lh';
    sourceRealHeight?: number;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const SpriteImg: React.FC<SpriteImgProps> = ({ spriteInfos, size, sourceRealHeight = spriteInfos.height, ...imgProps }) => {
    const settings = useSettingsGet();

    const sheetRelativeUrl = spriteInfos && getStaticDataGetSpritesheetImgUrl(spriteInfos.sheetName, {
        buildID: settings.data?.data.buildID,
    });
    const sheetUrl = getApiFullUrl(sheetRelativeUrl ?? '');

    const sourceRealSizeRatio = sourceRealHeight / spriteInfos.height;

    const sourceRealWidth = spriteInfos.width * sourceRealSizeRatio;

    const heightDiff = spriteInfos.height - sourceRealHeight;
    const widthDiff = spriteInfos.width - sourceRealWidth;

    const x = spriteInfos.x + widthDiff / 2;
    const y = spriteInfos.y + heightDiff / 2;

    size = size === '1lh' ? 19 : size;

    const scale = size && spriteInfos ? (size / sourceRealHeight) : 1;

    return <div
        {...imgProps}
        className={cx(css({
            flexShrink: 0,
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            verticalAlign: 'text-top',
            height: size,
            width: size,
            overflow: 'hidden',
        }), imgProps.className)}
    >
        <img
            src={sheetUrl}
            alt={`${spriteInfos.sheetName}-x=${x}-y=${y}`}
            className={css({
                objectFit: 'none',
                objectPosition: spriteInfos && `-${x}px -${y}px`,
                imageRendering: scale === 1 ? "pixelated" : undefined,
                height: sourceRealHeight,
                width: sourceRealWidth,
                transform: scale !== 1 ? `scale(${scale})` : undefined,
            })}
        />
    </div>;
};
