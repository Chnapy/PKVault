import { Loader } from '@mantine/core';
import type { PkmBaseDTO } from '../../data/sdk/model';
import { ItemImg } from '../../img/item-img';
import { useDragSubmitting } from '../../ui/interaction/move/hooks/use-drag-submitting';
import { useStorageMode } from '../../ui/inventory/context/storage-mode-context';
import type { MoveContainerValue } from '../move/move-container-fns';

export const StorageItemHeldItem: React.FC<Pick<PkmBaseDTO, 'heldItem' | 'contextVersion'> & {
    container: MoveContainerValue;
    slot: number;
    id: string;
}> = ({ heldItem, contextVersion, container, slot, id }) => {

    const storageMode = useStorageMode().state;
    const submitting = useDragSubmitting(container, slot, id);
    if (storageMode === 'inventory' && submitting)
        return <Loader size='sm' />;

    return heldItem > 0 && <ItemImg
        version={contextVersion}
        item={heldItem}
    />;
};
