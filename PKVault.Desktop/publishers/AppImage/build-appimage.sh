#!/bin/sh

set -e

dpkg --print-architecture

if [ "$(dpkg --print-architecture | grep -o 'arm')" ]; then
  ARCH="aarch64"
else
  ARCH="x86_64"
fi

# Build PKVault.AppImage in Linux context

echo "=== Building AppImage for Linux $ARCH ==="

# get appimagetool
wget https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-$ARCH.AppImage -O /usr/local/bin/appimagetool
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
./squashfs-root/AppRun /app/publish/pkvault.AppDir /app/publish/PKVault.AppImage

cp /app/publish/PKVault.AppImage /app/publish-final/
chmod +x /app/publish-final/PKVault.AppImage

# clean
rm -rf /usr/local/bin/appimagetool
