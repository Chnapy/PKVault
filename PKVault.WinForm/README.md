# PKVault.WinForm

This desktop app is just a view to backend & frontend.
It runs backend process & display frontend in window.

cp -r ../frontend/dist ./wwwroot

## Setup

This app requires builded frontend. You have 2 options:

Use a make command from project root (requires `make`).
It will build frontend and copy content to winform wwwroot/ folder.

```
make prepare-winform
```

Or copy frontend build content manually (requires frontend build before).

```
cp -r ../frontend/dist ./wwwroot
```

## Dev

Basic dev process.

```
dotnet run
```

> A terminal opens showing debug & logs.

## Build

Basic build process.

```
dotnet publish
```
