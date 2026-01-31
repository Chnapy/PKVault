import { useQuery } from '@tanstack/react-query';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';

/**
 * Check any app new release from github.
 */
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

    const canUpdate = (): boolean => {
        for (let i = 0; i < settingsVersion.length; i++) {
            const settingsPart = settingsVersion[ i ] ?? 0;
            const nextPart = nextVersion[ i ] ?? 0;

            if (nextPart === settingsPart) {
                continue;
            }

            return nextPart > settingsPart;
        }

        return false;
    };

    if (canUpdate()) {
        return name;
    }
};
