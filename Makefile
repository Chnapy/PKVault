
prepare-desktop:
	cd frontend && \
	npm run build && \
	cd .. && \
	rm -rf ./PKVault.Desktop/Resources/wwwroot && \
	cp -r ./frontend/dist ./PKVault.Desktop/Resources/wwwroot
