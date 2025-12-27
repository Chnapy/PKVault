
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
    id: string;
    path: string;
    isDirectory: boolean;
};

type OpenFolderResponse = {
    type: 'open-folder';
    id: string;
};

type Response = FileExploreResponse | OpenFolderResponse;

declare global {
    interface Window {
        chrome?: {
            webview: {
                postMessage: (message: unknown) => void;
            };
        };
    }
}

export const isDesktop = window.chrome?.webview !== undefined;

const desktopMessageType = 'desktop-message';

const isDesktopMessageResponse = (event: Event): event is CustomEvent<Response> => event.type === desktopMessageType;

const requestDesktop = (request: { type: string }) => {
    window.chrome?.webview.postMessage(request);
};

export const useDesktopMessage = () => {
    if (!isDesktop) {
        return undefined;
    }

    return {
        fileExplore: (request: FileExploreRequest) => new Promise<FileExploreResponse>(resolve => {
            const eventListener: EventListenerOrEventListenerObject = (event) => {
                console.log('Event from parent:', event);
                if (!isDesktopMessageResponse(event) || event.detail.type !== 'file-explore' || event.detail.id !== request.id) {
                    return;
                }

                window.removeEventListener(desktopMessageType, eventListener);

                resolve(event.detail);
            };

            window.addEventListener(desktopMessageType, eventListener);

            requestDesktop(request);
        }),
        openFile: (request: OpenFolderRequest) => new Promise<OpenFolderResponse>(resolve => {
            const eventListener: EventListenerOrEventListenerObject = (event) => {
                console.log('Event from parent:', event);
                if (!isDesktopMessageResponse(event) || event.detail.type !== 'open-folder' || event.detail.id !== request.id) {
                    return;
                }

                window.removeEventListener(desktopMessageType, eventListener);

                resolve(event.detail);
            };

            window.addEventListener(desktopMessageType, eventListener);

            requestDesktop(request);
        }),
    };
};
