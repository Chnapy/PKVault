import { RuntimeSystem, type DesktopMessageRequest } from '../../../data/sdk/model';
import { useSettingsGet } from '../../../data/sdk/settings/settings.gen';
import { MAUIDesktop } from './desktops/maui-desktop';
import { PhotinoDesktop } from './desktops/photino-desktop';

const getSendRequestFn = async () => {
    if (await MAUIDesktop.isEnabled())
        return MAUIDesktop.sendRequest;
    if (PhotinoDesktop.isEnabled())
        return PhotinoDesktop.sendRequest;
};

const requestDesktop = async (request: DesktopMessageRequest) => {
    const sendRequest = await getSendRequestFn();

    const response = await sendRequest!(request);
    console.log('received from desktop:', response);
    return response;
};

/**
 * Gives desktop actions only in desktop context.
 * If returns undefined, then app is in web context.
 */
export const useDesktopMessage = () => {
    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;

    return {
        fileExplore: settings?.canUseDesktopFileExplorer
            ? requestDesktop
            : undefined,
        openFile: settings?.canOpenFolder
            ? requestDesktop
            : undefined,
        androidPkvaultDirectory: settings?.runtimeSystem === RuntimeSystem.ANDROID
            ? requestDesktop
            : undefined,
    };
};
