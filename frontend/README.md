# PKVault frontend

All the frontend with visual interfaces & graphics is done here.

Dependencies & versions can be found in [package.json](./package.json).

## Technical foundations

PKVault frontend is based on recent Typescript and React 19+.

Data state management is using @tanstack/react-query.
Others state management cases are using basic React contexts.

Data fetching types, hooks and functions are generated from backend using Orval.

PKVault frontend is using common code conventions for this stack:
type safety, immutability, React principles, ...

## Setup

Basic dependencies install.

```
npm install
```

Generate backend SDK.

> Backend should be running !

```
npm run gen:sdk
```

## Run

Basic run process.

```
npm run dev
```

Then check logs to access app.

## Build

Basic build process.

```
npm run build
```
