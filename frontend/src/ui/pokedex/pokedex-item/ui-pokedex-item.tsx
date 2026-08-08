import React from 'react';
import { UISpeciesImgSkeleton } from '../../sprite-img/species-img/ui-species-img-skeleton';
import { useVisibilityContext } from '../../visibility/visibility-context';
import { UIPokedexItemRaw, type UIPokedexItemRawProps } from './ui-pokedex-item-raw';

export type UIPokedexItemProps = Omit<UIPokedexItemRawProps, 'ref'>;

export const UIPokedexItem: React.FC<UIPokedexItemProps> = props => {
    const visible = useVisibilityContext() ?? true;

    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (props.selected)
            ref.current?.scrollIntoView({
                behavior: 'instant',
                block: 'center',
                inline: 'center',
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return visible
        ? <UIPokedexItemRaw {...props} ref={ref} />
        : <UISpeciesImgSkeleton ref={ref} />;
};
