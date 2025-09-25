import { useStaticDataGet } from '../data/sdk/static-data/static-data.gen';

export const useStaticData = () => {
    const { data } = useStaticDataGet();

    if (!data) {
        throw new Error('Static data not loaded');
    }

    return {
        ...data.data,
        itemPokeball: data.data.items[ 4 ],
    };
};
