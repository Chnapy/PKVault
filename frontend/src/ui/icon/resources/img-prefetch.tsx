import type React from 'react';
import type { JSX } from 'react';

export const ImgPrefetch: React.FC<JSX.IntrinsicElements[ 'img' ]> = (props) => <img
    fetchPriority="low"
    loading="lazy"
    style={{
        opacity: 0,
        width: 0,
        height: 0,
        overflow: 'hidden',
    }}
    {...props}
/>;
