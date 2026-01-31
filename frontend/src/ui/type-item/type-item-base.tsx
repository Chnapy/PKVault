import { css, cx } from '@emotion/css';
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
        className={cx(css({
            backgroundColor: '#FFF',
            color: theme.text.default,
            position: 'relative',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        }), {
            [ css({
                cursor: 'pointer',
                '&:hover': {
                    textDecoration: 'underline'
                }
            }) ]: clickable
        }, rest.className)}
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
            className={css({
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
            })}
        >
            <img
                src={typeImg.img}
                className={css({
                    height: 20,
                    width: 20,
                    backgroundColor: typeImg.color
                })}
            />

            <div
                className={css({
                    flexGrow: 1,
                    padding: '0 4px',
                    textOverflow: 'clip',
                    overflow: 'hidden',
                    textAlign: 'left',
                })}
            >
                {name}
            </div>

            {rest.children}
        </div>
    </div>;
};
