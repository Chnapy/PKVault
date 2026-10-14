import type { DesktopMessageRequest, DesktopMessageResponse } from '../../../../data/sdk/model';
import { pick } from '../../../../util/pick';

type DotNetMethods = {
    Fetch: [
        [ string, Pick<RequestInit, 'method' | 'body' | 'headers'> | undefined ],
        Pick<Response, 'url' | 'ok' | 'status' | 'statusText'> & {
            headers: Record<string, string>;
            body?: string;
        },
    ];
    SendMessage: [
        [ DesktopMessageRequest ],
        DesktopMessageResponse | undefined
    ];
};

type InvokeDotNet = <K extends keyof DotNetMethods>(methodName: K, paramValues: DotNetMethods[ K ][ 0 ]) => Promise<DotNetMethods[ K ][ 1 ]>;

type HybridWebView = {
    /**
     * @deprecated unsafe usage in Android context, use MAUIDesktop instead.
     */
    InvokeDotNet: InvokeDotNet;
    SendRawMessage: (message: string) => unknown;
    __InvokeJavaScript: (taskId: string, methodName: (...args: unknown[]) => Promise<unknown>, args: unknown[]) => Promise<void>;
};

declare global {
    var HybridWebView: HybridWebView | undefined;
}

/**
 * Fix accents issue in Android only.
 * It doesn't require any action in Backend side.
 * 
 * @see https://github.com/Chnapy/PKVault/issues/304
 */
const jsonStringifyFixAndroid = (value: unknown) => JSON.stringify(value).replace(
    /[\u0080-\uffff]/g,
    (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
);

/**
 * Reimplementation of HybridWebView.InvokeDotNet,
 * fixing usage with Android, handling accents.
 * 
 * @see https://github.com/dotnet/maui/blob/main/src/Core/src/Handlers/HybridWebView/HybridWebView.ts
 */
const invokeDotNetFixed: InvokeDotNet = async (methodName, paramValues) => {
    // Must stay in sync with HybridWebViewHandler.InvokeDotNetPath / SendMessagePath.
    const InvokeDotNetEndpoint = '__hwvInvokeDotNet';

    interface JSInvokeMethodData {
        MethodName: string;
        ParamValues?: string[];
    }

    interface DotNetInvokeResult {
        IsJson?: boolean;
        Result?: string;
        IsError?: boolean;
        ErrorMessage?: string;
        ErrorType?: string;
        ErrorStackTrace?: string;
    }

    type DotNetErrorLike = {
        dotNetErrorType?: string;
        dotNetStackTrace?: string;
    };

    const body: JSInvokeMethodData = {
        MethodName: methodName
    };

    // if parameters were provided, serialize them first
    if (paramValues.length > 0) {
        body.ParamValues = paramValues.map(jsonStringifyFixAndroid);
    }

    const message = JSON.stringify(body);

    // send the request to .NET
    const requestUrl = `${window.location.origin}/${InvokeDotNetEndpoint}`;
    const rawResponse = await fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Maui-Invoke-Token': 'HybridWebView',
            'X-Maui-Request-Body': message // Some platforms (Android) do not expose the POST body
        },
        body: message
    });

    const response: DotNetInvokeResult = await rawResponse.json();

    // a null response is a null response
    if (!response) {
        return null;
    }

    // Check if the response indicates an error
    if (response.IsError) {
        const error: Error & DotNetErrorLike = new Error(response.ErrorMessage || 'Unknown error occurred in .NET method');
        if (response.ErrorType) {
            error.dotNetErrorType = response.ErrorType;
        }
        if (response.ErrorStackTrace) {
            error.dotNetStackTrace = response.ErrorStackTrace;
        }
        throw error;
    }

    // deserialize if there is JSON data
    if (response.IsJson) {
        return JSON.parse(response.Result!);
    }

    // otherwise return the primitive
    return response.Result;
};

const isEnabled = () => window.HybridWebView !== undefined;

export const MAUIDesktop = {
    isEnabled,
    fetch: (url: string, init?: RequestInit) => invokeDotNetFixed('Fetch', [
        url,
        // limit init content to avoid sending too much to backend
        init && pick(init, [ 'method', 'body', 'headers' ])
    ]),
    sendRequest: (request: DesktopMessageRequest) => {
        console.log('send to MAUI desktop:', request);

        return invokeDotNetFixed('SendMessage', [ request ]);
    },
};
