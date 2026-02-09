#!/bin/sh

# Build PKVault.AppImage in Linux context

echo "=== Building AppImage for Linux x86_64 ==="

apt-get update
apt-get install -y wget binutils file
rm -rf /var/lib/apt/lists/*

# get appimagetool
wget https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage -O /usr/local/bin/appimagetool
chmod +x /usr/local/bin/appimagetool

# copy desktop app
cp -r PKVault.Desktop/pkvault.AppDir /app/publish/pkvault.AppDir
mkdir -p /app/publish/pkvault.AppDir/usr/bin
ls /app/publish/pkvault.AppDir/usr
cp /app/publish/PKVault /app/publish/pkvault.AppDir/usr/bin/pkvault
chmod +x /app/publish/pkvault.AppDir/AppRun

/usr/local/bin/appimagetool --appimage-extract
# ls .
ARCH=x86_64 ./squashfs-root/AppRun /app/publish/pkvault.AppDir /app/publish/PKVault.AppImage

chmod +x /app/publish/PKVault.AppImage
echo "AppImage created: /app/publish/PKVault.AppImage"
ls -la /app

mkdir -p /app/publish-final
cp /app/publish/PKVault.exe /app/publish-final/ ||
    cp /app/publish/PKVault.AppImage /app/publish-final/
