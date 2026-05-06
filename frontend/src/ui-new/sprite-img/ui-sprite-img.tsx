import { clsx } from 'clsx';
import type React from 'react';
import type { SpriteInfo } from '../../data/sdk/model';
import classes from './ui-sprite-img.module.css';

export type UISpriteImgProps = {
    spriteInfos: SpriteInfo;
    sheetUrl: string;
    size?: number | '1lh';
    sourceRealHeight?: number;
    disabled?: boolean;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const UISpriteImg: React.FC<UISpriteImgProps> = ({ spriteInfos, sheetUrl, size, sourceRealHeight = spriteInfos.height, disabled, ...imgProps }) => {
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
        data-disabled={disabled || undefined}
        className={clsx(classes.uiSpriteImg, imgProps.className)}
        style={{
            height: size,
            width: size,
        }}
    >
        <img
            src={sheetUrl}
            alt={`${spriteInfos.sheetName}-x=${x}-y=${y}`}
            style={{
                objectFit: 'none',
                objectPosition: spriteInfos && `-${x}px -${y}px`,
                imageRendering: scale === 1 ? "pixelated" : undefined,
                height: sourceRealHeight,
                width: sourceRealWidth,
                transform: scale !== 1 ? `scale(${scale})` : undefined,
            }}
        />
    </div>;
};
