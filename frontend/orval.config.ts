import { defineConfig } from "orval";

const VITE_SERVER_URL: string | undefined = globalThis[ 'process' ]?.env?.VITE_SERVER_URL;

if (!VITE_SERVER_URL) {
  throw new Error("VITE_SERVER_URL env variable not defined");
}

export default defineConfig({
  backend: {
    input: {
      target: `${VITE_SERVER_URL}/swagger/v1/swagger.json`,
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
    // hooks: {
    //   afterAllFilesWrite: "prettier -w",
    // },
  },
  // "backend-zod": {
  //   ...commonConfig,
  //   output: {
  //     ...commonConfig.output,
  //     client: "zod",
  //     fileExtension: ".zod.gen.ts",
  //   },
  //   hooks: {
  //     afterAllFilesWrite: "prettier -w",
  //   },
  // },
});
