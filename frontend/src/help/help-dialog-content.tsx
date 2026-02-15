import { css } from '@emotion/css';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import ReactMarkdown, { type Components, type UrlTransform } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { theme } from '../ui/theme';
import { useHelpAnchorScroll } from './hooks/use-help-anchor-scroll';

type HelpDialogContentProps = {
    selectedEndPath: string;
    finalSelectedPath: string;
    anchor?: string;
    slugs?: string[];
};

export const HelpDialogContent: React.FC<HelpDialogContentProps> = ({ selectedEndPath, finalSelectedPath, anchor, slugs }) => {
    const persistContent = React.useRef('');

    const contentQuery = useQuery({
        queryKey: [ finalSelectedPath ],
        queryFn: () => fetch(finalSelectedPath ?? '')
            .then(res => res.text()),
        enabled: !!finalSelectedPath,
    });

    const markdownRef = useHelpAnchorScroll({
        anchor,
        slugs,
        selectedEndPath,
    });

    const content = contentQuery.data;
    if (!contentQuery.isLoading) {
        persistContent.current = content ?? '';
    }

    return <div
        ref={markdownRef}
        className={css({
            'h1,h2,h3': {
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                borderBottomColor: 'rgba(0,0,0,0.1)',
                textShadow: 'none',
            },
            h1: {
                fontSize: '1.8em',
                margin: 0,
            },
            a: {
                color: theme.text.primary,

                '&:hover': {
                    textDecoration: 'underline',
                },
            },
            code: {
                fontSize: '0.8em',
                backgroundColor: 'rgba(0,0,0,0.05)',
                textShadow: 'none',
                borderRadius: 3,
                padding: '0 .4em',
                whiteSpace: 'break-spaces',
            },
            summary: {
                cursor: 'pointer',

                '&:hover': {
                    textDecoration: 'underline',
                },
            },
            details: {
                padding: 4,
                margin: '2px 0',
                transition: 'background-color .2s',

                '&[open], &:hover': {
                    backgroundColor: 'rgba(0,0,0,0.02)'
                },

                '> p': {
                    marginLeft: '1em',
                }
            },
        })}
    >
        {persistContent.current && <ReactMarkdown
            rehypePlugins={[ rehypeSlug, rehypeRaw ]}
            urlTransform={getUrlTransform(selectedEndPath)}
            components={components}
        >
            {persistContent.current}
        </ReactMarkdown>}
    </div>;
};

const components: Components = {
    a: (props) => <a
        {...props}
        target={props.href?.startsWith('http') ? '__blank' : undefined}
    />,
};

const getUrlTransform = (selectedEndPath: string): UrlTransform => url => {
    // https://...
    if (url.startsWith('http')) {
        return url;
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
