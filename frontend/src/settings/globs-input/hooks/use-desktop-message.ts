import z from 'zod';

type WebViewRequest = {
    type: 'file-explore' | 'open-folder';
    id?: number;
    directoryOnly: boolean;
    basePath: string;
    title?: string;
    multiselect?: boolean;
};

type WebViewResponse = {
    type: string;
    id: number;
    directoryOnly: boolean;
    values?: string[];
};

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
            [{type: string}],
            WebViewResponse | undefined
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

export const isDesktop = () => external?.sendMessage !== undefined || window.HybridWebView !== undefined;

const desktopResponseSchema = z.object({
    detail: z.object({
        type: z.string()
    })
});

const isDesktopMessageResponse = (data: unknown): data is { detail: WebViewResponse } => desktopResponseSchema.safeParse(data).success;

const requestDesktop = (request: WebViewRequest) => {
    console.log('send to desktop:', request);

    if (window.HybridWebView) {
        return window.HybridWebView.InvokeDotNet('SendMessage', [request])
            .then(response => {
                
                console.log('received from desktop:', response);

                return response;
            });
    }

    return new Promise<WebViewResponse | undefined>(resolve => {
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
    if (!isDesktop()) {
        return undefined;
    }

    return {
        fileExplore: (request: WebViewRequest) => requestDesktop(request),

        openFile: (request: WebViewRequest) => requestDesktop(request),

        // startLoadingFinished: (hasError: boolean) => requestDesktop({
        //     type: 'start-finish',
        //     hasError,
        // } as StartFinishRequest),

    };
};
