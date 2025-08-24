import { defineConfig } from "orval";

export default defineConfig({
  backend: {
    input: {
      target: "https://code.lan:5000/swagger/v1/swagger.json",

      parserOptions: {
        validate: false,
      },
    },
    output: {
      client: "react-query",
      fileExtension: ".gen.ts",
      mode: "tags-split",
      target: "src/data/sdk/sdk.ts",
      schemas: "src/data/sdk/model",
      httpClient: "fetch",
      // baseUrl: "https://code.lan:5000",
      override: {
        mutator: {
          path: './src/data/mutator/custom-instance.ts',
          name: 'customInstance',
        },
        useTypeOverInterfaces: true,
      },
    },
    hooks: {
      afterAllFilesWrite: "prettier -w",
    },
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
