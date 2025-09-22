import React from 'react';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useStorageGetMainBoxes, useStorageGetMainPkms, useStorageGetSaveBoxes, useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { Route } from '../routes/storage';

export const StorageSearchCheck: React.FC<React.PropsWithChildren> = ({ children }) => {
    const navigate = Route.useNavigate();
    const storageSearch = Route.useSearch({ select: (search) => search });

    const mainBoxesQuery = useStorageGetMainBoxes();
    const mainPkmsQuery = useStorageGetMainPkms();
    const saveInfosQuery = useSaveInfosGetAll();
    const saveBoxesQuery = useStorageGetSaveBoxes(storageSearch.save ?? 0);
    const savePkmsQuery = useStorageGetSavePkms(storageSearch.save ?? 0);

    type SearchInput = typeof Route[ 'types' ][ 'searchSchemaInput' ];

    const redirectSearch = React.useMemo((): SearchInput | undefined => {
        if (storageSearch.save !== undefined) {
            if (saveInfosQuery.data && !(storageSearch.save in saveInfosQuery.data.data)) {
                return {
                    save: undefined,
                    saveBoxId: undefined,
                };
            } else if (storageSearch.saveBoxId !== undefined && saveBoxesQuery.data?.data.every(box => box.id !== storageSearch.saveBoxId)) {
                return {
                    saveBoxId: undefined,
                };
            }
        }

        if (storageSearch.mainBoxId !== undefined && mainBoxesQuery.data?.data.every(box => box.id !== storageSearch.mainBoxId!.toString())) {
            return {
                mainBoxId: undefined,
            };
        }

        if (
            (storageSearch.selected?.type === 'main' && mainPkmsQuery.data?.data.every(pkm => pkm.id !== storageSearch.selected!.id))
            || (storageSearch.selected?.type === 'save' && savePkmsQuery.data?.data.every(pkm => pkm.id !== storageSearch.selected!.id))
        ) {
            return {
                selected: undefined,
            };
        }
    }, [ mainBoxesQuery.data?.data, mainPkmsQuery.data?.data, saveBoxesQuery.data?.data, saveInfosQuery.data, savePkmsQuery.data?.data, storageSearch ]);

    React.useEffect(() => {
        if (redirectSearch) {
            navigate({
                search: redirectSearch
            });
        }
    }, [ navigate, redirectSearch ]);

    if (redirectSearch) {
        return null;
    }

    return children;
};
