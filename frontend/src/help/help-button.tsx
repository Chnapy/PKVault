import type React from 'react';
import { ButtonLikeLink, type ButtonLikeProps } from '../ui/button/button-like';
import { Icon } from '../ui/icon/icon';
import type { DocsGenEnSlugs } from './hooks/use-help-navigate';
import { css, cx } from '@emotion/css';
import { theme } from '../ui/theme';

export const HelpButton: React.FC<Omit<ButtonLikeProps<'a'>, 'as' | 'children'> & {
    slug: DocsGenEnSlugs;
}> = ({ slug, className, ...rest }) => {

    return <ButtonLikeLink
        {...rest}
        className={cx(
            css({
                color: theme.text.primary,
                borderRadius: 50,
            }),
            className
        )}
        to={'.'}
        search={{ help: slug }}
    >
        <Icon name='info-circle' solid />
    </ButtonLikeLink>;
};
