import { Skeleton } from '@mantine/core';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import React from 'react';
import { UIMarkdownRenderer, type UIMarkdownRendererProps } from '../ui/markdown-renderer/ui-markdown-renderer';
import { useHelpAnchorScroll } from './hooks/use-help-anchor-scroll';

type HelpDialogContentProps = Pick<UIMarkdownRendererProps, 'titleReduce'> & {
    selectedEndPath: string;
    finalSelectedPath: string;
    anchor?: string;
    slugs?: string[];
};

export const HelpDialogContent: React.FC<HelpDialogContentProps> = ({ selectedEndPath, finalSelectedPath, anchor, slugs, titleReduce }) => {
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

    if (contentQuery.isPending && contentQuery.isEnabled)
        return <Skeleton h='80vh' />

    const content = contentQuery.data;

    return <UIMarkdownRenderer
        ref={markdownRef}
        baseUrl={selectedEndPath}
        linkWithIcon
        titleReduce={titleReduce}
    >
        {content}
    </UIMarkdownRenderer>;
};
