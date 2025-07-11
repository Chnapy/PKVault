import { defineConfig, Options } from "orval";

const backendCommonConfig = {
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

const pokeapiCommonConfig = {
  output: {
    mode: "tags-split",
    target: "src/data/sdk-pokeapi/sdk-pokeapi.ts",
    schemas: "src/data/sdk-pokeapi/model",
    httpClient: "fetch",
    baseUrl: "https://pokeapi.co",
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
    target:
      "https://raw.githubusercontent.com/PokeAPI/pokeapi/refs/heads/master/openapi.yml",

    parserOptions: {
      validate: false,
    },
  },
} satisfies Options;

export default defineConfig({
  backend: {
    ...backendCommonConfig,
    output: {
      ...backendCommonConfig.output,
      client: "react-query",
      fileExtension: ".gen.ts",
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
  pokeapi: {
    ...pokeapiCommonConfig,
    output: {
      ...pokeapiCommonConfig.output,
      client: "react-query",
      fileExtension: ".gen.ts",
    },
    hooks: {
      afterAllFilesWrite: "prettier -w",
    },
  },
});
