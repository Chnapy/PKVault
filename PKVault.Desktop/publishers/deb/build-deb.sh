#!/bin/sh

set -e

# Build PKVault.deb in Linux context

echo "=== Building .deb for Linux x86_64 ==="

ls .

# copy exe
mkdir -p /app/publish/pkvault.deb/usr/bin
cp /app/publish/PKVault /app/publish/pkvault.deb/usr/bin/pkvault

# post-install
mkdir -p /app/publish/pkvault.deb/DEBIAN
cp ./postinst.sh /app/publish/pkvault.deb/DEBIAN/postinst

# control
# copy file injecting app version
mkdir -p /app/publish/pkvault.deb/DEBIAN
sed -e "s/(VERSION)/$VERSION/g" ./control > /app/publish/pkvault.deb/DEBIAN/control

# desktop file
mkdir -p /app/publish/pkvault.deb/usr/share/applications
cp ./pkvault.desktop /app/publish/pkvault.deb/usr/share/applications/

# all icon files
mkdir -p /app/publish/pkvault.deb/usr/share/icons/hicolor/16x16/apps/
cp ../common/icons/pkvault_16x16.png /app/publish/pkvault.deb/usr/share/icons/hicolor/16x16/apps/pkvault.png

mkdir -p /app/publish/pkvault.deb/usr/share/icons/hicolor/32x32/apps/
cp ../common/icons/pkvault_32x32.png /app/publish/pkvault.deb/usr/share/icons/hicolor/32x32/apps/pkvault.png

mkdir -p /app/publish/pkvault.deb/usr/share/icons/hicolor/48x48/apps/
cp ../common/icons/pkvault_48x48.png /app/publish/pkvault.deb/usr/share/icons/hicolor/48x48/apps/pkvault.png

mkdir -p /app/publish/pkvault.deb/usr/share/icons/hicolor/64x64/apps/
cp ../common/icons/pkvault_64x64.png /app/publish/pkvault.deb/usr/share/icons/hicolor/64x64/apps/pkvault.png

mkdir -p /app/publish/pkvault.deb/usr/share/icons/hicolor/128x128/apps/
cp ../common/icons/pkvault_128x128.png /app/publish/pkvault.deb/usr/share/icons/hicolor/128x128/apps/pkvault.png

mkdir -p /app/publish/pkvault.deb/usr/share/icons/hicolor/256x256/apps/
cp ../common/icons/pkvault_256x256.png /app/publish/pkvault.deb/usr/share/icons/hicolor/256x256/apps/pkvault.png

mkdir -p /app/publish/pkvault.deb/usr/share/icons/hicolor/scalable/apps/
cp ../common/icons/pkvault_scalable.svg /app/publish/pkvault.deb/usr/share/icons/hicolor/scalable/apps/pkvault.svg

# copyright
mkdir -p /app/publish/pkvault.deb/usr/share/doc/pkvault
cp ./copyright /app/publish/pkvault.deb/usr/share/doc/pkvault/

chmod 755 /app/publish/pkvault.deb/usr/bin/pkvault
chmod 755 /app/publish/pkvault.deb/DEBIAN/postinst
chmod 644 /app/publish/pkvault.deb/DEBIAN/control
chmod 644 /app/publish/pkvault.deb/usr/share/applications/pkvault.desktop
chmod 644 /app/publish/pkvault.deb/usr/share/doc/pkvault/copyright
chmod 644 /app/publish/pkvault.deb/usr/share/icons/hicolor/*/apps/pkvault.*

# build package
dpkg-deb --build /app/publish/pkvault.deb

lintian /app/publish/pkvault.deb.deb || true

mv /app/publish/pkvault.deb.deb /app/publish-final/PKVault.deb

# clean
rm -rf /app/publish/pkvault.deb
