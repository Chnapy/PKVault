import React from 'react';

const images: Record<string, { default: string } | undefined> = import.meta.glob('../../assets/pkhex/img/Big Items/bitem_*.png', { eager: true });

export type ItemImgProps = {
    spriteItem: number;
} & Omit<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, 'src'>;

export const ItemImg: React.FC<ItemImgProps> = ({ spriteItem, ...rest }) => {
    const heldItemImg = images[ `../../assets/pkhex/img/Big Items/bitem_${spriteItem}.png` ]?.default;

    if (!heldItemImg) {
        return null;
    }

    return <img src={heldItemImg} {...rest} />;
};
