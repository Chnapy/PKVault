import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import { WithControlsIcons } from '../../../interaction/controls/icons/with-controls-icons';
import { getDragControls } from '../../../interaction/focus-controls/common-controls/drag-controls';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';
import { useDragSubmitting } from '../../../interaction/move/hooks/use-drag-submitting';
import { useDroppable } from '../../../interaction/move/hooks/use-droppable';
import { UISpeciesImg } from '../../../sprite-img/species-img/ui-species-img';
import { useCurrentPanel } from '../../storage-content/context/ui-panel-context';
import { UIStorageItemBase, type UIStorageItemBaseProps } from '../base/ui-storage-item-base';

export type UIStorageItemPlaceholderProps<C = unknown> =
    & Omit<UIStorageItemBaseProps, 'slot'>
    & {
        nodeId: string;
        container: C;
        slot: number;
    };

export const UIStorageItemPlaceholder: React.FC<UIStorageItemPlaceholderProps> = ({
    label,
    nodeId,
    container,
    slot,
    loading,
    ...buttonProps
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
        buttonProps.ref,
    );

    const submitting = useDragSubmitting(container, slot);

    return <WithControlsIcons placement='out' icons={controlsIcons.drop}>
        <UIStorageItemBase
            label={droppable.helpText}
            disabled={!droppable.canDrop}
            loading={loading || submitting}
            {...focusControlProps}
            {...buttonProps}
            ref={ref}
        >
            <UISpeciesImg
                sheetUrl=''
                species={0}
                spriteInfos={{
                    height: 96,
                    width: 96,
                    x: 0,
                    y: 0,
                }}
            />
        </UIStorageItemBase>
    </WithControlsIcons>;
};
