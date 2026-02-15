#!/bin/sh

set -e

# Build PKVault.AppImage in Linux context

echo "=== Building AppImage for Linux x86_64 ==="

# get appimagetool
wget https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage -O /usr/local/bin/appimagetool
chmod +x /usr/local/bin/appimagetool

# copy exe
mkdir -p /app/publish/pkvault.AppDir/usr/bin
cp /app/publish/PKVault /app/publish/pkvault.AppDir/usr/bin/pkvault

# AppRun
cp ./AppRun /app/publish/pkvault.AppDir/
chmod +x /app/publish/pkvault.AppDir/AppRun

# desktop file
mkdir -p /app/publish/pkvault.AppDir/usr/share/applications
cp ./pkvault.desktop /app/publish/pkvault.AppDir/

# icon file
cp ../common/icons/pkvault_scalable.svg /app/publish/pkvault.AppDir/pkvault.svg

# build
/usr/local/bin/appimagetool --appimage-extract
ARCH=x86_64 ./squashfs-root/AppRun /app/publish/pkvault.AppDir /app/publish/PKVault.AppImage

cp /app/publish/PKVault.AppImage /app/publish-final/
chmod +x /app/publish-final/PKVault.AppImage

# clean
rm -rf /usr/local/bin/appimagetool
