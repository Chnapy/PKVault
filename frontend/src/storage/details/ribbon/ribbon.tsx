import type React from 'react';
import { useStaticData } from '../../../hooks/use-static-data';
import { UIRibbon } from '../../../ui/storage/storage-details/content/cosmetic/ui-ribbon';

type RibbonProps = {
    name: string;
    count: number;
};

export const Ribbon: React.FC<RibbonProps> = ({ name, count }) => {
    const staticData = useStaticData();

    const ribbon = staticData.ribbons[ name ];
    if (!ribbon)
        return null;

    return <UIRibbon
        spriteKey={ribbon.spriteKey}
        name={ribbon.name}
        count={count}
    />;
};
