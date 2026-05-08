import { SimpleGrid } from '@mantine/core';
import type React from 'react';

export type UIDetailsContentSummaryProps = {
    heldItem?: React.ReactNode;
    nature?: string;
    ability?: string;
    pid?: string;
};

export const UIDetailsContentSummary: React.FC<UIDetailsContentSummaryProps> = ({
    heldItem, nature, ability, pid
}) => {

    return <SimpleGrid cols={2} verticalSpacing='sm'>
        <div>
            Held item
        </div>
        <div>
            {heldItem ?? '-'}
        </div>

        <div>
            Nature
        </div>
        <div>
            {nature ?? '-'}
        </div>

        <div>
            Ability
        </div>
        <div>
            {ability ?? '-'}
        </div>

        <div>
            PID
        </div>
        <div>
            {pid ?? '-'}
        </div>
    </SimpleGrid>;
};
