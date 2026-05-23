import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import { getDragControls } from '../../../interaction/focus-controls/common-controls/drag-controls';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';
import { useDragSubmitting } from '../../../interaction/move/hooks/use-drag-submitting';
import { useDroppable } from '../../../interaction/move/hooks/use-droppable';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import { UIStorageItemPlaceholder, type UIStorageItemPlaceholderProps } from './ui-storage-item-placeholder';

type ContainerValue = {
    bank: string;
    saveId: number | null;
    box: number;
};

export type UIStorageItemPlaceholderWithInteractionProps = Pick<UIStorageItemPlaceholderProps, 'ref'>
    & ContainerValue
    & {
        slot: number;
    };

export const UIStorageItemPlaceholderWithInteraction: React.FC<UIStorageItemPlaceholderWithInteractionProps> = ({
    ref: refRoot,
    bank, saveId, box,
    slot,
}) => {
    const panel = useCurrentPanel();

    const targetContainer: ContainerValue = { bank, saveId, box };

    const droppable = useDroppable<ContainerValue>({
        targetContainer,
        targetPosition: slot,
        targetId: undefined,
    });

    const scopeNodeId = [ bank, saveId, box, slot ].join('-');

    const { focusControlProps } = useFocusControls({
        scopeNodeId,
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
        refRoot,
    );

    const submitting = useDragSubmitting<ContainerValue>(targetContainer, slot);

    return <UIStorageItemPlaceholder
        loading={submitting}
        // disabled={!isDroppable}
        {...focusControlProps}
        ref={ref}
    />;
};
