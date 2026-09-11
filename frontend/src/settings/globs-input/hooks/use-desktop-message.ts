import z from 'zod';
import type { DesktopMessageRequest, DesktopMessageResponse } from '../../../data/sdk/model';
import { useSettingsGet } from '../../../data/sdk/settings/settings.gen';

declare global {
    // Photino
    interface External {
        sendMessage?: (message: string) => void;
        receiveMessage?: (callback: (data: string) => void) => void;
    }

    type DotNetMethods = {
        Fetch: [
            [string, RequestInit | undefined],
            Pick<Response, 'url' | 'ok' | 'status' | 'statusText'> & {
                headers: Record<string, string>;
                body?: string;
            },
        ];
        SendMessage: [
            [DesktopMessageRequest],
            DesktopMessageResponse | undefined
        ];
    };

    // injected by MAUI
    var HybridWebView: {
        InvokeDotNet: <K extends keyof DotNetMethods>(methodName: K, paramValues: DotNetMethods[K][0]) => Promise<DotNetMethods[K][1]>;
        SendRawMessage: (message: string) => unknown;
        __InvokeJavaScript: (taskId: unknown, methodName: string, args: unknown) => unknown;
    } | undefined;
}

const external = window.external as External | undefined;

const desktopResponseSchema = z.object({
    detail: z.object({
        type: z.string()
    })
});

const isDesktopMessageResponse = (data: unknown): data is { detail: DesktopMessageResponse } => desktopResponseSchema.safeParse(data).success;

const requestDesktop = (request: DesktopMessageRequest) => {
    console.log('send to desktop:', request);

    if (window.HybridWebView) {
        return window.HybridWebView.InvokeDotNet('SendMessage', [request])
            .then(response => {
                
                console.log('received from desktop:', response);

                return response;
            });
    }

    return new Promise<DesktopMessageResponse | undefined>(resolve => {
        let resolved = false;

        external?.sendMessage?.(JSON.stringify(request));

        if (request.id !== undefined) {
            external?.receiveMessage?.(message => {
                if (resolved) {
                    return;
                }

                console.log('received from desktop:', message);

                const data = JSON.parse(message);

                if (!isDesktopMessageResponse(data) || data.detail.type !== request.type || data.detail.id !== request.id) {
                    return;
                }

                resolved = true;

                resolve(data.detail);
            });
        } else {
            resolve(undefined);
        }
    });
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
    };
};
