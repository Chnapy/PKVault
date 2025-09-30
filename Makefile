
prepare-winform:
	cd frontend && \
	VITE_SERVER_URL=https://localhost:5000 npm run build && \
	cd .. && \
	rm -rf ./PKVault.WinForm/wwwroot && \
	cp -r ./frontend/dist ./PKVault.WinForm/wwwroot
