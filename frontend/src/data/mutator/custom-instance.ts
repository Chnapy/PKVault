
const baseURL = import.meta.env.VITE_SERVER_URL;

if (!baseURL) {
    throw new Error("VITE_SERVER_URL env not defined");
}

export const getApiFullUrl = (url: string) => `${baseURL}${url}`;

export const customInstance = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const targetUrl = getApiFullUrl(url);

    const res = await fetch(targetUrl, init);

    const body = [ 204, 205, 304 ].includes(res.status) ? null : await res.text()
    const data = body ? JSON.parse(body) : {}

    return { data, status: res.status, headers: res.headers } as T;
};

export default customInstance;

// // In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this
// export type ErrorType<Error> = AxiosError<Error>;
// // In case you want to wrap the body type (optional)
// // (if the custom instance is processing data before sending it, like changing the case for example)
// export type BodyType<BodyData> = CamelCase<BodyType>;
