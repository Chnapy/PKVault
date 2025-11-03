import { useQuery } from '@tanstack/react-query';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';

export const useCheckUpdate = (): string | undefined => {
    const settingsQuery = useSettingsGet();
    const updateQuery = useQuery({
        queryKey: [ 'check-update' ],
        queryFn: () => fetch('https://api.github.com/repos/chnapy/PKVault/releases/latest')
            .then<{
                name: string;
                draft: boolean;
                prerelase: boolean;
            }>(res => res.json()),
    });

    if (!updateQuery.data || !settingsQuery.data) {
        return;
    }

    const { name, draft, prerelase } = updateQuery.data;

    if (draft || prerelase) {
        return;
    }

    const settingsVersion = settingsQuery.data.data.version.split('.').map(Number);

    const nextVersion = name.substring(1).split('.').map(Number);

    const canUpdate = settingsVersion.some((settingsPart, i) => {
        const nextPart = nextVersion[ i ];

        return typeof nextPart === 'number' && nextPart > settingsPart;
    });

    if (canUpdate) {
        return name;
    }
};
