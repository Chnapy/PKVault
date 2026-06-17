import { Card, Group, Text } from '@mantine/core';
import { SquareCheckIcon } from 'lucide-react';
import type React from 'react';
import { useSelectContextNullable } from '../../ui-new/interaction/select/context/use-select-context';
import { UICardSectionControl } from '../../ui-new/storage/storage-panel/card-section-control/ui-card-section-control';
import type { MoveContainerValue } from '../move/move-container-fns';
import { useCurrentStorageWithFallback } from '../panel/hooks/use-current-storage-with-fallback';
import { DetailsActions } from './details-actions';

export const MultiSelectActions: React.FC<{ enabled: boolean }> = ({ enabled }) => {
    const { saveId, box } = useCurrentStorageWithFallback().data ?? {};

    const selectCtx = useSelectContextNullable<MoveContainerValue>();
    const multiSelectIds = selectCtx?.useSelectStore(s => {
        if (s.ids.size === 0)
            return;

        if (!box)
            return false;

        const currentContainer = selectCtx.getContainerHash(saveId
            ? {
                type: 'save-item',
                saveId,
                boxId: box.id,
            }
            : {
                type: 'main-item',
                boxId: box.id,
            });

        return s.container === currentContainer
            ? s.ids
            : undefined;
    });

    if (!multiSelectIds)
        return null;

    return <Card>
        <Card.Section inheritPadding withBorder>
            <Group gap='sm'>
                <SquareCheckIcon />
                <Text>{multiSelectIds.size} pokemons selected</Text>
            </Group>
        </Card.Section>
        {enabled && <Card.Section component={UICardSectionControl} inheritPadding py='inherit' withBorder>
            <DetailsActions
                pkmIds={[ ...multiSelectIds ]}
                saveId={saveId ?? null}
            />
        </Card.Section>}
    </Card>;
};
