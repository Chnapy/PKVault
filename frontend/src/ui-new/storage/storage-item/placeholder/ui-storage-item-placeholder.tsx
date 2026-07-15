import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import { WithControlsIcons } from '../../../interaction/controls/icons/with-controls-icons';
import { getDragControls } from '../../../interaction/focus-controls/common-controls/drag-controls';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';
import { useDragSubmitting } from '../../../interaction/move/hooks/use-drag-submitting';
import { useDroppable } from '../../../interaction/move/hooks/use-droppable';
import { UISpeciesImgSkeleton } from '../../../sprite-img/species-img/ui-species-img-skeleton';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import { UIStorageItemBase, type UIStorageItemBaseProps } from '../base/ui-storage-item-base';

export type UIStorageItemPlaceholderProps<C = unknown> =
    & Omit<UIStorageItemBaseProps, 'slot'>
    & {
        nodeId: string;
        container: C;
        slot: number;
        globalOrder: number;
    };

export const UIStorageItemPlaceholder: React.FC<UIStorageItemPlaceholderProps> = ({
    label,
    nodeId,
    container,
    slot,
    globalOrder,
    loading,
    ...buttonProps
}) => {
    const panel = useCurrentPanel();

    const droppable = useDroppable({
        targetContainer: container,
        targetPosition: slot,
        targetId: undefined,
    });

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: nodeId,
        order: globalOrder,
        onFocus: ({ node }) => {
            droppable.focusNode(node);

            panel.normalizeCurrentPanel();
        },
        controls: [
            ...getDragControls({ droppable, droppableMain: true }),
        ],
    });

    const ref = useMergedRef(
        focusProps.ref,
        buttonProps.ref,
    );

    const submitting = useDragSubmitting(container, slot);

    return <WithControlsIcons placement='out' icons={controlIcons('drop')}>
        <UIStorageItemBase
            label={droppable.helpText}
            loading={loading || submitting}
            {...focusProps}
            {...controlProps('drop')}
            {...buttonProps}
            ref={ref}
        >
            <UISpeciesImgSkeleton visible={false} />
        </UIStorageItemBase>
    </WithControlsIcons>;
};
