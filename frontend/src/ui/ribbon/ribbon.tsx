import { css } from '@emotion/css';
import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';

type RibbonProps = {
    name: string;
    count: number;
};

export const Ribbon: React.FC<RibbonProps> = ({ name, count }) => {
    const staticData = useStaticData();

    return <img
        className={css({
            maxHeight: 30,
        })}
        src={`/imgs/ribbons/${staticData.ribbons[ name ]?.spriteKey}.png`}
        title={staticData.ribbons[ name ]?.name + (count > 1 ? `(${count})` : '')}
    />;
};
