import type React from 'react';
import { css, cx } from '@emotion/css';

import "@hackernoon/pixel-icon-library/fonts/iconfont.css";

export type IconProps = {
    name: string;
    solid?: boolean;
    alt?: boolean;
    forButton?: boolean;
}
    & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

/**
 * Icons from https://pixeliconlibrary.com/
 */
export const Icon: React.FC<IconProps> = ({ name, solid, alt, forButton, ...rest }) => {
    return <i
        {...rest}
        className={cx('hn', `hn-${name}${alt ? '-alt' : ''}${solid ? '-solid' : ''}`, {
            [ css({
                fontSize: '75%',
                lineHeight: '1lh',
                verticalAlign: 'middle',
            }) ]: forButton
        }, rest.className)}
    />;
};
