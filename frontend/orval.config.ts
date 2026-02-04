import { defineConfig } from "orval";

const VITE_OPENAPI_PATH: string | undefined = globalThis[ 'process' ]?.env?.VITE_OPENAPI_PATH;

if (!VITE_OPENAPI_PATH) {
  throw new Error("VITE_OPENAPI_PATH env variable not defined");
}

export default defineConfig({
  backend: {
    input: {
      target: VITE_OPENAPI_PATH,
    },
    output: {
      client: "react-query",
      fileExtension: ".gen.ts",
      mode: "tags-split",
      target: "src/data/sdk/sdk.ts",
      schemas: "src/data/sdk/model",
      httpClient: "fetch",
      urlEncodeParameters: true,
      override: {
        fetch: {
          // required by forceSuccessResponse
          // @see https://github.com/orval-labs/orval/issues/2550
          includeHttpResponseReturnType: true,
          forceSuccessResponse: true,
        },
        mutator: {
          path: './src/data/mutator/custom-instance.ts',
          name: 'customInstance',
        },
        useTypeOverInterfaces: true,
      },
    },
  },
});
