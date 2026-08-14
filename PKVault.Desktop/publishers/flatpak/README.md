# Flatpak publish

Flatpak published as:

- Bundle pkvault.flatpak (`build-flatpak.sh`)
- App in [Flathub store](https://flathub.org)

## Flathub

https://flathub.org

Related PR: https://github.com/flathub/flathub/pull/9743

---

Generate `desktop-nuget-sources.json`:

```sh
curl https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/refs/heads/master/dotnet/flatpak-dotnet-generator.py -o flatpak-dotnet-generator.py

python3 flatpak-dotnet-generator.py --dotnet 10 -f 25.08 desktop-nuget-sources.json PKVault.Desktop/PKVault.Desktop.csproj
```

Generate `frontend-npm-sources.json`:

```sh
pipx install git+https://github.com/flatpak/flatpak-builder-tools.git#subdirectory=node

flatpak-node-generator npm frontend/package-lock.json -o frontend-npm-sources.json
```

Tools from https://github.com/flatpak/flatpak-builder-tools.

---

Build flatpak from manifest:

```sh
flatpak run --command=flathub-build org.flatpak.Builder --install ./io.github.chnapy.pkvault.yml
```

Run linter:

```sh
flatpak run --command=flatpak-builder-lint org.flatpak.Builder manifest ./io.github.chnapy.pkvault.yml

flatpak run --command=flatpak-builder-lint org.flatpak.Builder repo ./repo
```

Commands from https://docs.flathub.org/docs/for-app-authors/submission.
