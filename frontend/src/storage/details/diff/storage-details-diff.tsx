import { Box, Table } from '@mantine/core';
import { clsx } from 'clsx';
import { DiffIcon } from 'lucide-react';
import type React from 'react';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { useStorageGetMainPkmVariantDiff } from '../../../data/sdk/storage/storage.gen';
import { getEntityContextGenerationName } from '../../../data/util/get-entity-context-generation-name';
import { useTranslate } from '../../../translate/i18n';
import { UIPopoverCard } from '../../../ui/popover/popover-card/ui-popover-card';
import classes from './storage-details-diff.module.css';

export const StorageDetailsDiff: React.FC<{ id: string }> = ({ id }) => {
    const { t } = useTranslate();

    const diffQuery = useStorageGetMainPkmVariantDiff(id, {
        query: {
            staleTime: 0,
            gcTime: 0,
        }
    });
    const diffEntries = Object.entries(diffQuery.data?.data ?? {});

    const variantsQuery = usePkmVariantIndex(data => {
        const variant = data.data.byId[ id ]!;
        const mainVariant = data.data.byBox[ variant.boxId ]?.[ variant.boxSlot ]?.find(v => v.isMain);
        return [ mainVariant!, variant ] as const;
    });
    const variants = variantsQuery.data;
    const columnHeads = variants?.map(v => getEntityContextGenerationName(v.context, true))
        ?? [ '-', '-' ];

    return <UIPopoverCard
        title={t('details.diff')}
        icon={<DiffIcon />}
    >
        <Box className={classes.storageDetailsDiff}>
            <Table
                horizontalSpacing='md'
                verticalSpacing='xs'
            >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th />
                        {columnHeads.map(head => <Table.Th key={head}>{head}</Table.Th>)}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {diffEntries.map(([ property, { item1, item2 } ]) => <Table.Tr key={property}>
                        <Table.Th>{property}</Table.Th>
                        {[ item1, item2 ].map((item, i) => <Table.Td key={i}
                            className={clsx(
                                item === 'null' && classes.null
                            )}
                        >{item}</Table.Td>)}
                    </Table.Tr>)}
                </Table.Tbody>
            </Table>
        </Box>
    </UIPopoverCard>;
};
