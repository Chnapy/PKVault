import clsx from 'clsx';
import React from 'react';
import { switchUtil } from '../../../../util/switch-util';
import classes from './control-icon.module.css';

export const ControlIcon: React.FC<{ rawSvg: string } & Omit<React.SVGProps<SVGSVGElement>, 'children'>> = ({ rawSvg, ...rest }) => {
    const { attributes, childrenHtml } = React.useMemo((): { attributes: React.SVGProps<SVGSVGElement>; childrenHtml: string; } => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');

        if (!svgElement) {
            return { attributes: {}, childrenHtml: '' };
        }

        const attrs: Record<string, string> = {};
        for (const attr of svgElement.attributes) {
            // we don't have to handle all possible cases
            const reactName = switchUtil<
                string,
                Record<string, keyof React.SVGProps<SVGSVGElement>>
            >(attr.name, {
                class: 'className',
                'xmlns:xlink': 'xmlnsXlink',
            }) ?? attr.name;
            attrs[ reactName ] = attr.value;
        }

        return {
            attributes: attrs,
            childrenHtml: svgElement.innerHTML,
        };
    }, [ rawSvg ]);

    return (
        <svg
            {...attributes}
            {...rest}
            viewBox="0 0 64 64"
            className={clsx(attributes.className, classes.controlIcon, rest.className)}
            dangerouslySetInnerHTML={{ __html: childrenHtml }}
        />
    );
};
