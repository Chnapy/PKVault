import { Card, Group, Text } from '@mantine/core';
import { SquareCheckIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../translate/i18n';
import { WithControlsIcons } from '../../ui/interaction/controls/icons/with-controls-icons';
import { useControls } from '../../ui/interaction/controls/use-controls';
import { getBackControl } from '../../ui/interaction/focus-controls/common-controls/back-controls';
import { Focus } from '../../ui/interaction/focus/provider/use-focus-context';
import { useFocusScopeContext } from '../../ui/interaction/focus/scope/use-focus-scope-context';
import { useSelectContextNullable } from '../../ui/interaction/select/context/use-select-context';
import { UICardSectionControl } from '../../ui/storage/storage-panel/card-section-control/ui-card-section-control';
import type { MoveContainerValue } from '../move/move-container-fns';
import { useCurrentStorageWithFallback } from '../panel/hooks/use-current-storage-with-fallback';
import { DetailsActions } from './details-actions';

export const MultiSelectActions: React.FC<{ enabled: boolean }> = ({ enabled }) => {
    const { t } = useTranslate();

    const { saveId, box } = useCurrentStorageWithFallback().data ?? {};

    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

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

    // console.log(
    //     parentScope,
    //     Focus.useIsInScopeStack(parentScope.scopeId),
    //     Focus.useIsScopeActive(parentScope.scopeId),
    // );

    const { pushScope, popScope } = Focus.usePushPopScope();

    const wasInPopover = Focus.useIsInScopeStack(parentScope.scopeId);
    const isInPopover = Focus.useIsScopeActive(parentScope.scopeId);
    const isInPanel = Focus.useIsScopeActive('storage-content');    // TODO use variable (value from ui-storage-content.tsx)
    const controlsEnabled = enabled && (isInPopover || isInPanel);

    const { controlProps, controlIcons } = useControls(
        'multi-select-panel',
        controlsEnabled && isInPopover,
        order,
        [
            !wasInPopover && {
                name: 'focus',
                label: t('action.focus'),
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                        allowPressedSuite: 4,
                    },
                },
                spread: true,
                action: () => {
                    pushScope(parentScope.scopeId);
                },
            },
            isInPopover && getBackControl({
                label: t('action.back'),
                action: () => {
                    popScope(parentScope.scopeId);
                },
            }),
        ],
        { enabled: controlsEnabled }
    );

    if (!multiSelectIds)
        return null;

    return <WithControlsIcons placement='in' icons={controlIcons('focus')}>
        <Card {...controlProps('focus')} mih={0} style={{
            flexGrow: 1,
            position: 'initial',
            overflow: 'initial',
        }}>
            <Card.Section inheritPadding withBorder>
                <Group gap='sm'>
                    <SquareCheckIcon />
                    <Text>
                        {t('storage.actions.select-title', { count: multiSelectIds.size })}
                    </Text>
                </Group>
            </Card.Section>
            {enabled && <Card.Section component={UICardSectionControl} inheritPadding py='inherit' withBorder>
                <DetailsActions
                    pkmIds={[ ...multiSelectIds ]}
                    saveId={saveId ?? null}
                    deleteAllRelatedVariants
                />
            </Card.Section>}
        </Card>
    </WithControlsIcons>;
};
