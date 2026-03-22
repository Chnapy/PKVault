import { css } from '@emotion/css';
import type { JSX } from 'react';

export const LinkWithIcon: React.FC<JSX.IntrinsicElements[ 'a' ]> = ({ children, ...props }) => {
    const getOrigin = () => {
        try {
            return new URL(props.href ?? '').origin;
        } catch {
            return;
        }
    };

    const origin = getOrigin();

    const icon = <img
        className={css({
            verticalAlign: 'text-bottom',
            marginRight: 4,
            width: 16,
            height: 16,
        })}
        src={origin && `${origin}/favicon.ico`}
    />;

    return <a
        {...props}
    >
        {icon}
        {children}
    </a>;
};
