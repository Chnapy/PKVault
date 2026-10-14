import z from 'zod';
import type { DesktopMessageRequest, DesktopMessageResponse } from '../../../../data/sdk/model';

declare global {
    // Photino
    interface External {
        sendMessage?: (message: string) => void;
        receiveMessage?: (callback: (data: string) => void) => void;
    }
}

const desktopResponseSchema = z.object({
    detail: z.object({
        type: z.number()    // DesktopMessageType
    })
});

const isDesktopMessageResponse = (data: unknown): data is { detail: DesktopMessageResponse } => desktopResponseSchema.safeParse(data).success;

const isEnabled = () => window.external?.sendMessage !== undefined && window.external.receiveMessage !== undefined;

const sendRequest = (request: DesktopMessageRequest) => {
    console.log('send to Photino desktop:', request);

    return new Promise<DesktopMessageResponse | undefined>(resolve => {
        let resolved = false;

        window.external.sendMessage!(JSON.stringify(request));

        if (request.id !== undefined) {
            window.external.receiveMessage!(message => {
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

export const PhotinoDesktop = {
    isEnabled,
    sendRequest,
};
