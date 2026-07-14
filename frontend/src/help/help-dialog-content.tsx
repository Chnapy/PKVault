import { Anchor, Code, Text, Title } from '@mantine/core';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import React from 'react';
import ReactMarkdown, { type Components, type UrlTransform } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { LinkWithIcon } from '../ui/link-with-icon/link-with-icon';
import classes from './help-dialog.module.css';
import { useHelpAnchorScroll } from './hooks/use-help-anchor-scroll';

type HelpDialogContentProps = {
    selectedEndPath: string;
    finalSelectedPath: string;
    anchor?: string;
    slugs?: string[];
};

export const HelpDialogContent: React.FC<HelpDialogContentProps> = ({ selectedEndPath, finalSelectedPath, anchor, slugs }) => {
    const contentQuery = useQuery({
        queryKey: [ finalSelectedPath ],
        queryFn: () => fetch(finalSelectedPath ?? '')
            .then(res => res.text()),
        enabled: !!finalSelectedPath,
        placeholderData: keepPreviousData,
    });

    const markdownRef = useHelpAnchorScroll({
        anchor,
        slugs,
        selectedEndPath,
    });

    const content = contentQuery.data;

    return <div
        ref={markdownRef}
        className={classes.helpDialogContent}
    >
        {content && <ReactMarkdown
            rehypePlugins={[ rehypeSlug, rehypeRaw ]}
            urlTransform={getUrlTransform(selectedEndPath)}
            components={components}
        >
            {content}
        </ReactMarkdown>}
    </div>;
};

const components: Components = {
    h1: (props) => <Title order={1} {...props} />,
    h2: (props) => <Title order={2} {...props} />,
    h3: (props) => <Title order={3} {...props} />,
    h4: (props) => <Title order={4} {...props} />,
    h5: (props) => <Title order={5} {...props} />,
    h6: (props) => <Title order={6} {...props} />,
    p: props => <Text {...props} />,
    a: (props) => props.href?.startsWith('http')
        ? <LinkWithIcon {...props} target={'__blank'} />
        : <Anchor {...props} />,
    code: (props) => <Code {...props} />,
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
