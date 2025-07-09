import { defineConfig, Options } from "orval";

const commonConfig = {
  output: {
    mode: "tags-split",
    target: "src/data/sdk/sdk.ts",
    schemas: "src/data/sdk/model",
    httpClient: "fetch",
    baseUrl: "http://code.lan:5000",
    override: {
      useTypeOverInterfaces: true,
      //   paramsSerializerOptions: {
      //     qs: {
      //       arrayFormat: "repeat",
      //     },
      //   },
    },
  },
  input: {
    target: "http://code.lan:5000/swagger/v1/swagger.json",

    parserOptions: {
      validate: false,
    },
  },
  hooks: {
    afterAllFilesWrite: "prettier -w",
  },
} satisfies Options;

export default defineConfig({
  "react-query": {
    ...commonConfig,
    output: {
      ...commonConfig.output,
      client: "react-query",
      fileExtension: ".gen.ts",
    },
    hooks: {
      afterAllFilesWrite: "prettier -w",
    },
  },
  zod: {
    ...commonConfig,
    output: {
      ...commonConfig.output,
      client: "zod",
      fileExtension: ".zod.gen.ts",
    },
    hooks: {
      afterAllFilesWrite: "prettier -w",
    },
  },
});
