import React from 'react';

export type ItemImgProps = {
    spriteItem: number;
} & Omit<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, 'src'>;

export const ItemImg: React.FC<ItemImgProps> = ({ spriteItem, ...rest }) => {
    const [ heldItemImg, setHeldItemImg ] = React.useState('');

    React.useEffect(() => {
        import(`../../assets/pkhex/img/Big Items/bitem_${spriteItem}.png`)
            .then(mod => setHeldItemImg(mod.default))
            .catch(() => setHeldItemImg(''))
    }, [ spriteItem ]);

    return <img src={heldItemImg} {...rest} />;
};
