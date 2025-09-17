import { css } from '@emotion/css';
import type React from 'react';
import { theme } from '../theme';
import { getTypeImg } from './util/get-type-img';

export type TypeItemBaseProps = {
    type: number;
    name: string;
    clickable?: boolean;
}
    & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const TypeItemBase: React.FC<TypeItemBaseProps> = ({ type, name, clickable, ...rest }) => {
    const typeImg = getTypeImg(type);

    return <div
        {...rest}
        className={css({
            backgroundColor: '#FFF',
            color: theme.text.default,
            position: 'relative',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            ...clickable
                ? {
                    cursor: 'pointer',
                    '&:hover': {
                        textDecoration: 'underline'
                    }
                }
                : undefined,
            ...rest.style,
        })}
    >
        <div
            className={css({
                position: 'absolute',
                left: 5,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: typeImg.color,
                opacity: 0.25,
            })}
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
                    width: 20,
                    backgroundColor: typeImg.color
                }}
            />

            <div
                style={{
                    flexGrow: 1,
                    padding: '0 4px',
                    textOverflow: 'clip',
                    overflow: 'hidden',
                    textAlign: 'left',
                }}
            >
                {name}
            </div>

            {rest.children}
        </div>
    </div>;
};
