import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import { WithControlsIcons } from '../../../interaction/controls/icons/with-controls-icons';
import { getDragControls } from '../../../interaction/focus-controls/common-controls/drag-controls';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';
import { useDragSubmitting } from '../../../interaction/move/hooks/use-drag-submitting';
import { useDroppable } from '../../../interaction/move/hooks/use-droppable';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import { UIStorageItemPlaceholder, type UIStorageItemPlaceholderProps } from './ui-storage-item-placeholder';

export type UIStorageItemPlaceholderWithInteractionProps<C = unknown> = UIStorageItemPlaceholderProps
    & {
        nodeId: string;
        container: C;
        slot: number;
    };

export const UIStorageItemPlaceholderWithInteraction: React.FC<UIStorageItemPlaceholderWithInteractionProps> = ({
    nodeId,
    container,
    slot,
    ...rest
}) => {
    const panel = useCurrentPanel();

    const droppable = useDroppable({
        targetContainer: container,
        targetPosition: slot,
        targetId: undefined,
    });

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: nodeId,
        onFocus: ({ node }) => {
            droppable.focusNode(node);

            panel.normalizeCurrentPanel();
        },
        controls: [
            ...getDragControls({ droppable }),
        ],
    });

    const ref = useMergedRef(
        focusControlProps.ref,
        rest.ref,
    );

    const submitting = useDragSubmitting(container, slot);

    return <WithControlsIcons placement='out' icons={controlsIcons.drop}>
        <UIStorageItemPlaceholder
            loading={submitting}
            // disabled={!isDroppable}
            {...focusControlProps}
            {...rest}
            ref={ref}
        />
    </WithControlsIcons>;
};
