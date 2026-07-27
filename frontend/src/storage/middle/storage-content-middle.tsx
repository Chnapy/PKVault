import type React from 'react';
import { UISplitButton } from '../../ui/storage/storage-content/middle/ui-split-button';
import { UIStorageContentMiddle } from '../../ui/storage/storage-content/middle/ui-storage-content-middle';
import { useCurrentStorage } from '../panel/storage-panel-context';
import { Route } from '../../routes/storage';

export const StorageContentMiddle: React.FC = () => {
    const leftStorage = useCurrentStorage('left');
    const rightStorage = useCurrentStorage('right');

    const toRightEnabled = Route.useSearch({
        select: select => {
            const left = leftStorage.getStorage(select.storages);
            return left && left.saveId !== rightStorage.getStorage(select.storages)?.saveId;
        },
    });

    const toLeftEnabled = Route.useSearch({
        select: select => {
            const right = rightStorage.getStorage(select.storages);
            return right && right.saveId !== leftStorage.getStorage(select.storages)?.saveId;
        },
    });

    const navigate = Route.useNavigate();

    return <UIStorageContentMiddle>
        <UISplitButton
            direction='right'
            position='top'
            disabled={!toRightEnabled}
            onClick={() => navigate({
                search: search => {
                    const left = leftStorage.getStorage(search.storages);
                    if (!left)
                        return search;

                    return {
                        ...search,
                        storages: rightStorage.setStorage(search.storages, { ...left }),
                    };
                },
            })}
        />

        <UISplitButton
            direction='left'
            position='bottom'
            disabled={!toLeftEnabled}
            onClick={() => navigate({
                search: search => {
                    const right = rightStorage.getStorage(search.storages);
                    if (!right)
                        return search;

                    return {
                        ...search,
                        storages: leftStorage.setStorage(search.storages, { ...right }),
                    };
                },
            })}
        />
    </UIStorageContentMiddle>;
};
