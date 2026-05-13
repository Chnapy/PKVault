import { clsx } from 'clsx';
import type React from 'react';
import type { SpriteInfo } from '../../data/sdk/model';
import classes from './ui-sprite-img.module.css';

export type UISpriteImgProps = {
    sheetUrl: string;
    spriteInfos: Pick<SpriteInfo, 'x' | 'y' | 'width' | 'height'>;
    sourceRealHeight?: number;
    disabled?: boolean;
    dropShadow?: boolean;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const UISpriteImg: React.FC<UISpriteImgProps> = ({ sheetUrl, spriteInfos, sourceRealHeight, disabled, dropShadow, className, style, ...imgProps }) => {
    return <div
        {...imgProps}
        data-disabled={disabled || undefined}
        className={clsx(
            classes.uiSpriteImg,
            dropShadow && classes.dropShadow,
            className,
        )}
        style={{
            '--sprite-infos-x-px': spriteInfos.x + 'px',
            '--sprite-infos-y-px': spriteInfos.y + 'px',
            '--sprite-infos-height-px': spriteInfos.height + 'px',
            '--sprite-infos-width-px': spriteInfos.width + 'px',
            '--source-real-height-px': sourceRealHeight && (sourceRealHeight + 'px'),
            ...style,
        } as React.CSSProperties}
    >
        {sheetUrl && <img
            src={sheetUrl}
            alt={`sprite`}
        />}
    </div>;
};
