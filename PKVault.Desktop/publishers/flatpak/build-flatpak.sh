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
cp ./io.github.chnapy.pkvault.desktop ./build/files/share/applications/

# all icon files
# mkdir -p ./build/files/share/icons/hicolor/16x16/apps/
# cp ../common/icons/pkvault_16x16.png ./build/files/share/icons/hicolor/16x16/apps/io.github.chnapy.pkvault.png

# mkdir -p ./build/files/share/icons/hicolor/32x32/apps/
# cp ../common/icons/pkvault_32x32.png ./build/files/share/icons/hicolor/32x32/apps/io.github.chnapy.pkvault.png

# mkdir -p ./build/files/share/icons/hicolor/48x48/apps/
# cp ../common/icons/pkvault_48x48.png ./build/files/share/icons/hicolor/48x48/apps/io.github.chnapy.pkvault.png

# mkdir -p ./build/files/share/icons/hicolor/64x64/apps/
# cp ../common/icons/pkvault_64x64.png ./build/files/share/icons/hicolor/64x64/apps/io.github.chnapy.pkvault.png

mkdir -p ./build/files/share/icons/hicolor/128x128/apps/
cp ../common/icons/pkvault_128x128.png ./build/files/share/icons/hicolor/128x128/apps/io.github.chnapy.pkvault.png

mkdir -p ./build/files/share/icons/hicolor/256x256/apps/
cp ../common/icons/pkvault_256x256.png ./build/files/share/icons/hicolor/256x256/apps/io.github.chnapy.pkvault.png

# metainfo file
# copy file injecting app version
mkdir -p ./build/files/share/metainfo/
cp ./io.github.chnapy.pkvault.metainfo.xml ./build/files/share/metainfo/io.github.chnapy.pkvault.metainfo.xml

# metadata file
cp ./metadata ./build/

# generate AppStream compiled metadata (share/app-info)
mkdir -p ./build/files/share/app-info
# workaround symlink for appstreamcli
mkdir -p ./build/files/usr
ln -sf "$(pwd)/build/files/share" "./build/files/usr/share"

# do not validate since some links depends of future release
# appstreamcli validate "./build/files/share/metainfo/io.github.chnapy.pkvault.metainfo.xml"

appstreamcli compose --no-net --prefix=/ --origin=local \
    --components=io.github.chnapy.pkvault \
    --result-root=./build/files/share/app-info/xmls \
    --data-dir=./build/files/share/app-info/xmls \
    "./build/files"

# find ./build -name "*.gz"

flatpak build-finish \
    --socket=fallback-x11 --socket=wayland --share=ipc \
    --share=network --device=all \
    --env=__NV_DISABLE_EXPLICIT_SYNC=1 \
	--filesystem=~/.var/app/org.chnapy.pkvault:ro --command=PKVault ./build

cp ./build/files/share/app-info/xmls/local.xml.gz ./build/files/share/app-info/xmls/io.github.chnapy.pkvault.xml.gz

ostree --repo=./repo init --mode=archive

flatpak build-export --disable-sandbox ./repo ./build master

flatpak build-update-repo --generate-static-deltas ./repo

flatpak build-bundle ./repo ./PKVault.flatpak io.github.chnapy.pkvault master

mkdir -p /app/publish-final
cp ./PKVault.flatpak /app/publish-final/

# check install success
flatpak --user install --noninteractive /app/publish-final/PKVault.flatpak
flatpak info io.github.chnapy.pkvault

# clean
flatpak --user uninstall --noninteractive io.github.chnapy.pkvault
flatpak uninstall -y --unused
rm -rf "${FLATPAK_USER_DIR}" ./repo ./build ./.cache
