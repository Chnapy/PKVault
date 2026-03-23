import { css, cx } from '@emotion/css';
import type { JSX } from 'react';
import type React from 'react';

export const ImgPrefetch: React.FC<JSX.IntrinsicElements[ 'img' ]> = (props) => <img
    fetchPriority="low"
    loading="lazy"
    {...props}
    className={cx(css({
        opacity: 0,
        width: 0,
        height: 0,
        overflow: 'hidden',
    }), props.className)}
/>;
