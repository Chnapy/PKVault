import React from 'react';
import docsGen from '../docs.gen';

const menuEn = docsGen
    .filter(item => item.language === 'en');

type UseHelpAnchorScrollParams = {
    anchor?: string;
    slugs?: string[];
    selectedEndPath?: string;
};

export const useHelpAnchorScroll = ({ anchor, slugs, selectedEndPath }: UseHelpAnchorScrollParams) => {
    const markdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const getElement = () => {
            if (!markdownRef.current || !anchor || !slugs) {
                // console.log('no helpAnchor/content', { helpAnchor, content });
                return;
            }

            const anchorCleaned = decodeURI(anchor);

            const element = markdownRef.current.querySelector(`#${CSS.escape(anchorCleaned)}`);
            if (element) {
                // console.log('scroll to', helpAnchor);
                return element;
            }

            const enItem = menuEn.find(item => item.endPath === selectedEndPath);
            const slugIndex = enItem?.slugs.indexOf(anchorCleaned as never) ?? -1;
            const newAnchor = slugs[ slugIndex ];
            if (newAnchor) {
                // console.log('scroll to', newAnchor);
                return markdownRef.current.querySelector(`#${CSS.escape(newAnchor)}`);
            }
            // console.log('anchor not found');
        };

        setTimeout(
            () => getElement()?.scrollIntoView(),
            200
        );
    }, [ anchor, slugs, selectedEndPath ]);

    return markdownRef;
};
