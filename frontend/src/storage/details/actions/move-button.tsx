import { MoveIcon } from 'lucide-react';
import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useStorageGetInventoryItems } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import { UIButton, type UIButtonProps } from '../../../ui/form/button/ui-button';
import { useControlsCurrentType } from '../../../ui/interaction/controls/use-controls-current-type';
import { useDragging } from '../../../ui/interaction/move/hooks/use-dragging';
import { pick } from '../../../util/pick';
import { useSelectCallback } from '../../../util/use-select-callback';
import type { MoveContainerValue } from '../../move/move-container-fns';

export type MoveButtonProps = Pick<UIButtonProps, 'focusOnMount'> & {
    id: string;
    saveId: number | null;
    isInventory?: boolean;
};

export const MoveButton: React.FC<MoveButtonProps> = ({ id, saveId, isInventory, focusOnMount }) => {
    const { t } = useTranslate();

    const pkmIndexQuery = usePkmIndex(saveId ?? null,
        useSelectCallback(data => {
            const pkm = data.data.byId[ id ];
            return pkm && pick(pkm, [ 'id', 'boxId' ]);
        }, [ id ]),
        { enabled: !isInventory });

    const inventoryQuery = useStorageGetInventoryItems({ saveId }, {
        query: {
            select: useSelectCallback(data => data.data[ id ], [ id ]),
            enabled: isInventory,
        },
    });

    const item = isInventory
        ? inventoryQuery.data
        : pkmIndexQuery.data;

    const boxId = item?.boxId;

    const container = React.useMemo((): MoveContainerValue => isInventory
        ? {
            type: 'inventory-item',
            saveId: saveId ?? undefined,
            boxId: boxId?.toString() ?? '',
        }
        : saveId
            ? {
                type: 'save-item',
                saveId,
                boxId: boxId?.toString() ?? '',
            }
            : {
                type: 'main-item',
                boxId: boxId?.toString() ?? '',
            }, [ boxId, isInventory, saveId ]);

    const dragging = useDragging(item?.id ?? '', container, false);
    // eslint-disable-next-line react-hooks/refs
    const draggingMove = dragging.useDrag();

    const controlsType = useControlsCurrentType();

    const onClickMove: UIButtonProps[ 'onClick' ] = controlsType === 'mouse'
        ? draggingMove.toggleDragByClick
        : draggingMove.toggleDragByFocus;

    return <UIButton
        name='move'
        controlLabel='Move'
        onClick={onClickMove}
        size='compact-md'
        leftSection={<MoveIcon />}
        disabled={!draggingMove.enabled}
        focusOnMount={focusOnMount}
        // eslint-disable-next-line react-hooks/refs
        ref={dragging.ref}
    >
        {t('storage.actions.move')}
    </UIButton>;
};
