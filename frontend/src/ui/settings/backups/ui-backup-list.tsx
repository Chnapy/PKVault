import { Card, Table } from '@mantine/core';
import type React from 'react';
import { getScrollPadding } from '../../scrollbar-width/util/get-scroll-padding';

type UIBackupListProps = {
    header: React.ReactNode;
    children: React.ReactNode;
};

export const UIBackupList: React.FC<UIBackupListProps> = ({ header, children }) => {
    return <Card mah='100%' style={{ overflow: 'auto' }}>
        <Card.Section>
            {header}
        </Card.Section>

        <Card.Section withBorder inheritPadding py='md' pr={getScrollPadding('md')} style={{ overflow: 'auto', scrollbarGutter: 'stable' }}>
            <Table horizontalSpacing='md'>
                <Table.Tbody>
                    {children}
                </Table.Tbody>
            </Table>
        </Card.Section>
    </Card>;
};
