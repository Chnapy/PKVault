import { Card, Group, Text } from '@mantine/core';
import { SquareCheckIcon } from 'lucide-react';
import type React from 'react';
import { Route } from '../../routes/storage';
import { useSelectContextNullable } from '../../ui-new/interaction/select/context/use-select-context';
import { UICardSectionControl } from '../../ui-new/storage/storage-panel/card-section-control/ui-card-section-control';
import type { MoveContainerValue } from '../move/move-container-fns';
import { useCurrentStorage } from '../panel/storage-panel-context';
import { DetailsActions } from './details-actions';

export const MultiSelectActions: React.FC<{ enabled: boolean }> = ({ enabled }) => {
    const { getStorage } = useCurrentStorage();
    const saveId = Route.useSearch({ select: search => getStorage(search.storages)?.saveId });
    const boxId = Route.useSearch({ select: search => getStorage(search.storages)?.boxId });

    const selectCtx = useSelectContextNullable<MoveContainerValue>();
    const multiSelectIds = selectCtx?.useSelectStore(s => {
        if (s.ids.size === 0)
            return;

        const container = selectCtx.getContainerValue(s.container);

        const enabled = container.saveId === saveId
            && Number(container.boxId) === boxId;

        return enabled
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
