import type React from 'react';
import type { SpriteInfo } from '../../data/sdk/model';

export type SpriteImgProps = {
    spriteInfos: SpriteInfo;
    size?: number | '1lh';
    sourceRealHeight?: number;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
