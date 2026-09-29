import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import { WithControlsIcons } from '../../../interaction/controls/icons/with-controls-icons';
import { useDragControls } from '../../../interaction/focus-controls/common-controls/drag-controls';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';
import { useDragSubmitting } from '../../../interaction/move/hooks/use-drag-submitting';
import { useDroppable } from '../../../interaction/move/hooks/use-droppable';
import { UIItemImgSkeleton } from '../../../sprite-img/item-img/ui-item-img-skeleton';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import { UIStorageItemBase, type UIStorageItemBaseProps } from '../base/ui-storage-item-base';

export type UIStorageInventoryItemPlaceholderProps<C = unknown> =
    & Omit<UIStorageItemBaseProps, 'slot'>
    & {
        nodeId: string;
        container: C;
        slot: number;
        globalOrder: number;
    };

export const UIStorageInventoryItemPlaceholder: React.FC<UIStorageInventoryItemPlaceholderProps> = ({
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

    const submitting = useDragSubmitting(container, slot);
    loading ||= submitting;

    const dragControls = useDragControls({
        droppable,
        droppableMain: true,
        disabled: loading,
    });

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: nodeId,
        order: globalOrder,
        onFocus: ({ node }) => {
            droppable.focusNode(node);

            panel.normalizeCurrentPanel();
        },
        controls: [
            ...dragControls,
        ],
    });

    const ref = useMergedRef(
        focusProps.ref,
        buttonProps.ref,
    );

    return <WithControlsIcons placement='out' icons={controlIcons('drop')}>
        <UIStorageItemBase
            label={droppable.helpText}
            loading={loading}
            {...focusProps}
            {...controlProps('drop')}
            {...buttonProps}
            ref={ref}
        >
            <UIItemImgSkeleton visible={false} />
        </UIStorageItemBase>
    </WithControlsIcons>;
};
