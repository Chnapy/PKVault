import z from 'zod';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as webviewTypes from 'webview2-types';

type FileExploreRequest = {
    type: 'file-explore';
    id: number;
    directoryOnly: boolean;
    basePath: string;
    title?: string;
    multiselect: boolean;
};

type FileExploreResponse = {
    type: 'file-explore';
    id: number;
    directoryOnly: boolean;
    values: string[];
};

type OpenFolderRequest = {
    type: 'open-folder';
    path: string;
    isDirectory: boolean;
};

type StartFinishRequest = {
    type: 'start-finish';
    hasError: boolean;
};

type Response = | FileExploreResponse;

const webview = window.chrome?.webview;

export const isDesktop = webview?.postMessage !== undefined;

const desktopResponseSchema = z.object({
    detail: z.object({
        type: z.string()
    })
});

const isDesktopMessageResponse = (data: unknown): data is { detail: Response } => desktopResponseSchema.safeParse(data).success;

const requestDesktop = <R extends Response>(request: { type: string; id?: string | number; }) => new Promise<R>(resolve => {
    let resolved = false;

    console.log('send to desktop:', request);

    webview?.postMessage?.(JSON.stringify(request));

    if (request.id !== undefined) {
        webview?.addEventListener('desktop', e => {
            if (resolved || !(e instanceof CustomEvent)) {
                return;
            }
            const data = e.detail;

            console.log('received from desktop:', data);

            if (!isDesktopMessageResponse(data) || data.detail.type !== request.type || data.detail.id !== request.id) {
                return;
            }

            resolved = true;

            resolve(data.detail as R);
        });
    } else {
        resolve(undefined as never);
    }
});

/**
 * Gives desktop actions only in desktop context.
 * If returns undefined, then app is in web context.
 */
export const useDesktopMessage = () => {
    if (!isDesktop) {
        return undefined;
    }

    return {
        fileExplore: (request: FileExploreRequest) => requestDesktop<FileExploreResponse>(request),

        openFile: (request: OpenFolderRequest) => requestDesktop<never>(request),

        startLoadingFinished: (hasError: boolean) => requestDesktop<never>({
            type: 'start-finish',
            hasError,
        } as StartFinishRequest),

    };
};
