
prepare-winform:
	cd frontend && \
	VITE_SERVER_URL=http://localhost:5000 VITE_DESKTOP=1 npm run build && \
	cd .. && \
	rm -rf ./PKVault.WinForm/wwwroot && \
	cp -r ./frontend/dist ./PKVault.WinForm/wwwroot
