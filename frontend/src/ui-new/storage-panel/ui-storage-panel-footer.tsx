import { Box, Group, Text } from '@mantine/core';
import type React from 'react';

export type UIStoragePanelFooterProps = {
    boxSize: number;
    pkmCount: number;
    pkmTotalCount: number;
};

export const UIStoragePanelFooter: React.FC<UIStoragePanelFooterProps> = ({ boxSize, pkmCount, pkmTotalCount }) => {
    return <Text component="div" size='sm'>
        <Group justify='space-between'>
            <div />
            {/* <Button variant='default'>
                        Foobar
                    </Button> */}
            <Box>
                {pkmCount}/{boxSize}
            </Box>
            <Box>
                total {pkmTotalCount}
            </Box>
        </Group>
    </Text>;
};
