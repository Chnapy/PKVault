
type FileExploreRequest = {
    type: 'file-explore';
    id: number;
    directoryOnly: boolean;
    basePath: string;
    title?: string;
    multiselect: boolean;
};

type FileExploreResponse = {
    id: number;
    directoryOnly: boolean;
    values: string[];
};

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

const isFileExploreResponse = (event: Event): event is CustomEvent<FileExploreResponse> => event.type === 'fileExplore';

const requestFileExplore = (request: FileExploreRequest) => {
    window.chrome?.webview.postMessage(request);
};

export const useFileExplore = () => {
    if (!isDesktop) {
        return undefined;
    }

    return (request: FileExploreRequest) => new Promise<FileExploreResponse>(resolve => {
        const eventListener: EventListenerOrEventListenerObject = (event) => {
            console.log('Event from parent:', event);
            if (!isFileExploreResponse(event) || event.detail.id !== request.id) {
                return;
            }

            window.removeEventListener('fileExplore', eventListener);

            resolve(event.detail);
        };

        window.addEventListener('fileExplore', eventListener);

        requestFileExplore(request);
    });
};
