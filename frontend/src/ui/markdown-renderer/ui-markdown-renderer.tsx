import { Anchor, Code, Text, Title, type TitleOrder } from '@mantine/core';
import React from 'react';
import ReactMarkdown, { type Components, type UrlTransform } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { UILinkWithIcon } from '../link-with-icon/ui-link-with-icon';
import classes from './ui-markdown-renderer.module.css';

export type UIMarkdownRendererProps = {
    ref?: React.Ref<HTMLDivElement>;
    baseUrl?: string;
    linkWithIcon?: boolean;
    titleReduce?: number;
    children?: string;
};

export const UIMarkdownRenderer: React.FC<UIMarkdownRendererProps> = ({ ref, baseUrl, linkWithIcon = false, titleReduce = 0, children }) => {
    const components = React.useMemo(() => getComponents(linkWithIcon, titleReduce), [ linkWithIcon, titleReduce ]);

    return <div
        ref={ref}
        className={classes.uiMarkdownRenderer}
    >
        {children && <ReactMarkdown
            rehypePlugins={[ rehypeSlug, rehypeRaw ]}
            urlTransform={baseUrl ? getUrlTransform(baseUrl) : undefined}
            components={components}
        >
            {children}
        </ReactMarkdown>}
    </div>;
};

const getComponents = (linkWithIcon: boolean, titleReduce: number): Components => ({
    h1: (props) => <Title order={Math.min(1 + titleReduce, 6) as TitleOrder} {...props} />,
    h2: (props) => <Title order={Math.min(2 + titleReduce, 6) as TitleOrder} {...props} />,
    h3: (props) => <Title order={Math.min(3 + titleReduce, 6) as TitleOrder} {...props} />,
    h4: (props) => <Title order={Math.min(4 + titleReduce, 6) as TitleOrder} {...props} />,
    h5: (props) => <Title order={Math.min(5 + titleReduce, 6) as TitleOrder} {...props} />,
    h6: (props) => <Title order={Math.min(6 + titleReduce, 6) as TitleOrder} {...props} />,
    p: props => <Text {...props} />,
    a: (props) => linkWithIcon && props.href?.startsWith('http')
        ? <UILinkWithIcon {...props} target={'__blank'} />
        : <Anchor {...props} />,
    code: (props) => <Code {...props} />,
});

const getUrlTransform = (selectedEndPath: string): UrlTransform => url => {
    // https://...
    if (url.startsWith('http')) {
        return url;
    }

    if (url.startsWith('/docs/')) {
        return url.replaceAll('/docs/functional/img/', '/docs/img/');
    }

    if (url.startsWith('../img/')) {
        return url.replaceAll('../img/', '/docs/img/');
    }

    // /.github/...
    if (url.startsWith('/')) {
        return `https://github.com/Chnapy/PKVault/blob/main${url}`;
    }

    // console.log({ url });

    // ./4-pokedex.md => 4-pokedex.md
    if (url.startsWith('./')) {
        url = `${url.slice(2)}`;
        // #attached-pokemons => 0-technical.md#attached-pokemons
    } else if (url.startsWith('#')) {
        url = `${selectedEndPath}${url}`;
    }

    const { hash, searchParams } = getUrlHashAndParams();

    searchParams.set('help', url);

    return `${hash}?${searchParams}`;
};

const getUrlHashAndParams = () => {
    const parts = window.location.hash.split('?');
    const hash = parts[ 0 ] || '#';

    const searchParamsStr = parts[ 1 ] ?? '';
    const searchParams = new URLSearchParams(searchParamsStr);

    return {
        hash,
        searchParams
    };
};
