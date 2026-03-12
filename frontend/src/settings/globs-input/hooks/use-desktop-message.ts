import z from 'zod';

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

declare global {
    interface External {
        sendMessage?: (message: string) => void;
        receiveMessage?: (callback: (data: string) => void) => void;
    }
}

export const isDesktop = window.external.sendMessage !== undefined;

const desktopResponseSchema = z.object({
    detail: z.object({
        type: z.string()
    })
});

const isDesktopMessageResponse = (data: unknown): data is { detail: Response } => desktopResponseSchema.safeParse(data).success;

const requestDesktop = <R extends Response>(request: { type: string; id?: string | number; }) => new Promise<R>(resolve => {
    let resolved = false;

    console.log('send to desktop:', request);

    window.external.sendMessage?.(JSON.stringify(request));

    if (request.id !== undefined) {
        window.external.receiveMessage?.(message => {
            if (resolved) {
                return;
            }

            console.log('received from desktop:', message);

            const data = JSON.parse(message);

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
