import type React from 'react';

export type SpriteImgProps = {
    sourceRealHeight?: number;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
