
# PKVault.Core

core-build:
	dotnet build PKVault.Core

core-test:
	dotnet run --project PKVault.Core.Tests

core-test-file:
	dotnet run --project PKVault.Core.Tests -class $(NAME)

# PKVault.Backend

backend-build:
	dotnet build PKVault.Backend

backend-run:
	dotnet run --project PKVault.Backend

backend-publish:
	dotnet publish PKVault.Backend

# PKVault.Desktop

desktop-build:
	dotnet build PKVault.Desktop

desktop-run:
	dotnet run --project PKVault.Desktop

desktop-publish:
	dotnet publish PKVault.Desktop

desktop-prepare:
	cd frontend && \
	npm run build && \
	cd .. && \
	rm -rf PKVault.Desktop/Resources/wwwroot && \
	cp -r frontend/dist PKVault.Desktop/Resources/wwwroot

# frontend

front-dev:
	npm run dev

front-build:
	npm run build

# Scripts

pkhex-update:
	dotnet run --project Scripts update-pkhex

static-data-generate:
	dotnet run --project Scripts gen-static-data

migration-generate:
	dotnet run --project Scripts gen-migration $(NAME)
