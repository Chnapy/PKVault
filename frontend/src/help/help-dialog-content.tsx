import { keepPreviousData, useQuery } from '@tanstack/react-query';
import React from 'react';
import { UIMarkdownRenderer } from '../ui-new/markdown-renderer/ui-markdown-renderer';
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

    return <UIMarkdownRenderer
        ref={markdownRef}
        baseUrl={selectedEndPath}
        linkWithIcon
    >
        {content}
    </UIMarkdownRenderer>;
};
