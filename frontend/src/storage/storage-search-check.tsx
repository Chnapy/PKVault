import React from 'react';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useStorageGetMainBoxes, useStorageGetMainPkms } from '../data/sdk/storage/storage.gen';
import { Route } from '../routes/storage';

export const StorageSearchCheck: React.FC<React.PropsWithChildren> = ({ children }) => {
    const navigate = Route.useNavigate();
    const storageSearch = Route.useSearch({ select: (search) => search });

    const mainBoxesQuery = useStorageGetMainBoxes();
    const mainPkmsQuery = useStorageGetMainPkms();
    const saveInfosQuery = useSaveInfosGetAll();
    // const saveBoxesQuery = useStorageGetSaveBoxes(storageSearch.save ?? 0);
    // const savePkmsQuery = useStorageGetSavePkms(storageSearch.save ?? 0);

    type SearchInput = typeof Route[ 'types' ][ 'searchSchemaInput' ];

    const redirectSearch = React.useMemo((): SearchInput | undefined => {
        try {
            if (saveInfosQuery.data && storageSearch.saves !== undefined) {
                const cleanedSaves = Object.entries(storageSearch.saves).reduce((acc, [ saveId, save ]) => {
                    if (!(+saveId in saveInfosQuery.data.data) || (save && !(save.saveId in saveInfosQuery.data.data))) {
                        delete acc[ +saveId ];
                    }
                    return acc;
                }, { ...storageSearch.saves });

                if (Object.keys(storageSearch.saves).length !== Object.keys(cleanedSaves).length) {
                    return {
                        saves: cleanedSaves,
                    };
                }
                // else if (storageSearch.saveBoxId !== undefined && saveBoxesQuery.data?.data.every(box => box.id !== storageSearch.saveBoxId)) {
                //     return {
                //         saveBoxId: undefined,
                //     };
                // }
            }

            if (storageSearch.mainBoxIds && storageSearch.mainBoxIds.length > 0 && mainBoxesQuery.data
                && storageSearch.mainBoxIds.some(id => mainBoxesQuery.data.data.every(box => box.id !== id.toString()))) {
                return {
                    mainBoxIds: undefined,
                };
            }

            if (
                (storageSearch.selected && !storageSearch.selected.saveId && mainPkmsQuery.data?.data.every(pkm => pkm.id !== storageSearch.selected!.id))
            ) {
                return {
                    selected: undefined,
                };
            }
        } catch (error) {
            console.error(error);
            return;
        }
    }, [ mainBoxesQuery.data, mainPkmsQuery.data, saveInfosQuery.data, storageSearch.mainBoxIds, storageSearch.saves, storageSearch.selected ]);

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
