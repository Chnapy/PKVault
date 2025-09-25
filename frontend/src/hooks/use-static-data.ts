import { useQuery } from '@tanstack/react-query';
import { getStaticDataGetQueryKey, staticDataGet, type staticDataGetResponse } from '../data/sdk/static-data/static-data.gen';

export const useStaticData = () => {
    const { data } = useStaticDataPersisted();

    if (!data) {
        throw new Error('Static data not loaded');
    }

    return {
        ...data.data,
        itemPokeball: data.data.items[ 4 ],
    };
};

export const useStaticDataPersisted = () => {
    const queryKey = getStaticDataGetQueryKey();
    const query = useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            let persistedData: staticDataGetResponse | null = null;

            try {
                const persistedDataRaw = localStorage.getItem(queryKey[ 0 ]);
                persistedData = persistedDataRaw ? JSON.parse(persistedDataRaw) : null;
                // eslint-disable-next-line no-empty
            } catch { }

            if (persistedData) {
                return persistedData;
            }

            const data = await staticDataGet({ signal });
            if (data.status === 200) {
                localStorage.setItem(queryKey[ 0 ], JSON.stringify(data));
            }
            return data;
        }
    });

    return query;
};
