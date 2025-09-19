import { useSettingsEdit, useSettingsGet } from '../data/sdk/settings/settings.gen';
import { Button } from '../ui/button/button';
import { Splash } from '../ui/splash/splash';
import { SplashData } from './splash-data';

export const SplashMain: React.FC<React.PropsWithChildren> = ({ children }) => {
    const settingsQuery = useSettingsGet();
    const settingsEditMutation = useSettingsEdit();

    const settingsMutable = settingsQuery.data?.data.settingsMutable;

    if (settingsQuery.isLoading || !settingsMutable) {
        return <Splash />;
    }

    if (settingsMutable.language) {
        return <SplashData>{children}</SplashData>;
    }

    return <Splash>
        <div
            style={{
                textAlign: 'center',
            }}
        >Choose prefered language</div>
        <div
            style={{
                marginTop: 8,
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
            }}
        >
            <Button big onClick={() => settingsEditMutation.mutateAsync({
                data: {
                    ...settingsMutable,
                    language: 'en',
                }
            })}>English</Button>
            <Button big onClick={() => settingsEditMutation.mutateAsync({
                data: {
                    ...settingsMutable,
                    language: 'fr',
                }
            })}>Français</Button>
        </div>
    </Splash>;
};
