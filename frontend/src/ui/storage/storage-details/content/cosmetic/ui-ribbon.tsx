import { Box, Tooltip } from '@mantine/core';
import type React from 'react';

export type UIRibbonProps = {
    spriteKey: string;
    name: string;
    count: number;
};

export const UIRibbon: React.FC<UIRibbonProps> = ({ spriteKey, name, count }) => {
    return <Tooltip label={name + (count > 1 ? ` (${count})` : '')}>
        <Box
            component='img'
            mah={30}
            src={`/imgs/ribbons/${spriteKey}.png`}
        />
    </Tooltip>;
};
