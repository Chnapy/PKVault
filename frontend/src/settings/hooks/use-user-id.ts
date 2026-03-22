import { useSettingsGet } from '../../data/sdk/settings/settings.gen';

export const useUserId = () => {
    const { data, isLoading } = useSettingsGet();

    if (!data) {
        return {
            data: undefined,
            isLoading,
        }
    }

    return {
        data: data.headers.get('userid'),
        isLoading: false,
    };
};
