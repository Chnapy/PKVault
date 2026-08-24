import { useQuery } from '@tanstack/react-query';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';

export const getReleaseVersionState = (releaseName: string, settingsVersion: string): 'new' | 'old' | 'same' => {
    const settingsVersionParts = settingsVersion.split('.').map(Number);
    const releaseVersionParts = releaseName.split('.').map(Number);

    for (let i = 0; i < settingsVersionParts.length; i++) {
        const settingsPart = settingsVersionParts[ i ] ?? 0;
        const releasePart = releaseVersionParts[ i ] ?? 0;

        if (releasePart === settingsPart) {
            continue;
        }

        return releasePart > settingsPart
            ? 'new'
            : 'old';
    }

    return 'same';
};

/**
 * Check any app new release from github.
 */
export const useCheckUpdate = (): string | undefined => {
    const settingsQuery = useSettingsGet();
    const updateQuery = useQuery({
        queryKey: [ 'check-update' ],
        queryFn: () => fetch('https://api.github.com/repos/chnapy/PKVault/releases/latest')
            .then<Partial<{
                name: string;
                draft: boolean;
                prerelease: boolean;
            }> | undefined>(res => res.json()),
    });

    if (!updateQuery.data?.name || !settingsQuery.data) {
        return;
    }

    const { name, draft, prerelease } = updateQuery.data;

    if (draft || prerelease) {
        return;
    }

    const releaseState = getReleaseVersionState(name.substring(1), settingsQuery.data.data.version);

    return releaseState === 'new'
        ? name
        : undefined;
};
