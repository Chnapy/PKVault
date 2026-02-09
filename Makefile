
prepare-desktop:
	cd frontend && \
	VITE_SERVER_URL=http://localhost:5000 npm run build && \
	cd .. && \
	rm -rf ./PKVault.Desktop/Resources/wwwroot && \
	cp -r ./frontend/dist ./PKVault.Desktop/Resources/wwwroot
