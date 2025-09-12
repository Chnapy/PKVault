import type React from 'react';
import { getTypeImg } from './util/get-type-img';

export type TypeItemBaseProps = {
    type: number;
    name: string;
}
    & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const TypeItemBase: React.FC<TypeItemBaseProps> = ({ type, name, ...rest }) => {
    const typeImg = getTypeImg(type);

    return <div
        {...rest}
        style={{
            backgroundColor: '#FFF',
            position: 'relative',
            ...rest.style,
        }}
    >
        <div
            style={{
                position: 'absolute',
                left: 5,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: typeImg.color,
                opacity: 0.25
            }}
        />

        <div
            style={{
                position: 'relative',
                display: 'flex',
            }}
        >
            <img
                src={typeImg.img}
                style={{
                    height: 20,
                    backgroundColor: typeImg.color
                }}
            />

            <div
                style={{
                    flexGrow: 1,
                    padding: '0 4px'
                }}
            >
                {name}
            </div>

            {rest.children}
        </div>
    </div>;
};
