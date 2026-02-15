#!/bin/sh

set -e

# Build PKVault.flatpak in Linux context

# Note: sandboxing cannot work in Docker build context,
# so build is done without sandbox.

# copy exe
mkdir -p ./build
cp /app/publish/PKVault ./build/pkvault
chmod +x ./build/pkvault

mkdir -p ./build/files/bin
cp ./build/pkvault ./build/files/bin/PKVault
chmod +x ./build/files/bin/PKVault

# desktop file
mkdir -p ./build/files/share/applications/
cp ./org.chnapy.pkvault.desktop ./build/files/share/applications/

# all icon files
mkdir -p ./build/files/share/icons/hicolor/32x32/apps/
cp ../common/icons/pkvault_32x32.png ./build/files/share/icons/hicolor/32x32/apps/org.chnapy.pkvault.png

mkdir -p ./build/files/share/icons/hicolor/64x64/apps/
cp ../common/icons/pkvault_64x64.png ./build/files/share/icons/hicolor/64x64/apps/org.chnapy.pkvault.png

mkdir -p ./build/files/share/icons/hicolor/128x128/apps/
cp ../common/icons/pkvault_128x128.png ./build/files/share/icons/hicolor/128x128/apps/org.chnapy.pkvault.png

mkdir -p ./build/files/share/icons/hicolor/256x256/apps/
cp ../common/icons/pkvault_256x256.png ./build/files/share/icons/hicolor/256x256/apps/org.chnapy.pkvault.png

# metainfo file
# copy file injecting app version
mkdir -p ./build/files/share/metainfo/
sed -e "s/(VERSION)/$VERSION/g" ./org.chnapy.pkvault.metainfo.xml > ./build/files/share/metainfo/org.chnapy.pkvault.metainfo.xml

# metadata file
cp ./metadata ./build/

flatpak build-finish \
    --socket=x11 --socket=wayland --share=ipc \
    --share=network --device=dri \
	--filesystem=home --command=PKVault ./build

ostree --repo=./repo init --mode=archive

flatpak build-export --disable-sandbox ./repo ./build master

flatpak build-bundle ./repo ./PKVault.flatpak org.chnapy.pkvault master

mkdir -p /app/publish-final
cp ./PKVault.flatpak /app/publish-final/

# check install success
flatpak --user install --noninteractive /app/publish-final/PKVault.flatpak

# clean
flatpak --user uninstall --noninteractive org.chnapy.pkvault org.gnome.Platform//49 org.gnome.Sdk//49
flatpak --user remote-delete --force flathub
rm -rf "${FLATPAK_USER_DIR}" ./repo ./build
