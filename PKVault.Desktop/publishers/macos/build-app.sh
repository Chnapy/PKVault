#!/bin/sh

set -e

# Build PKVault.app in macOS context (also runs on Linux, no real Mac required)
# Usage: ./build-app.sh <rid> <version> <publish-dir> <output-dir>

# Note: falls back to "icnsutil" (pip) and "rcodesign" when iconutil/codesign
# aren't available (i.e. running on Linux).

RID="${1:-osx-arm64}"
VERSION="${2:-dev}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PUBLISH_DIR="${3:-$SCRIPT_DIR/../../../out/$RID}"
OUT_DIR="${4:-$SCRIPT_DIR/../../../out}"
APP_DIR="$OUT_DIR/PKVault.app"

echo "=== Building PKVault.app for $RID ==="

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR/Contents/MacOS"
mkdir -p "$APP_DIR/Contents/Resources"

# copy exe (excluding app-generated data and loose files that break signing)
find "$PUBLISH_DIR" -mindepth 1 -maxdepth 1 \
  ! -name logs ! -name db ! -name backup ! -name '*.sav' \
  ! -name '*.pdb' ! -name '*.runtimeconfig.json' ! -name swagger.json \
  -exec cp -r {} "$APP_DIR/Contents/MacOS/" \;
mv "$APP_DIR/Contents/MacOS/PKVault" "$APP_DIR/Contents/MacOS/pkvault"
chmod 755 "$APP_DIR/Contents/MacOS/pkvault"

# Info.plist
sed -e "s/(VERSION)/$VERSION/g" "$SCRIPT_DIR/Info.plist" > "$APP_DIR/Contents/Info.plist"

# icon: build .icns from the common iconset
ICONSET_DIR=$(mktemp -d)/pkvault.iconset
mkdir -p "$ICONSET_DIR"
COMMON_ICONS="$SCRIPT_DIR/../common/icons"

cp "$COMMON_ICONS/pkvault_16x16.png" "$ICONSET_DIR/icon_16x16.png"
cp "$COMMON_ICONS/pkvault_32x32.png" "$ICONSET_DIR/icon_16x16@2x.png"
cp "$COMMON_ICONS/pkvault_32x32.png" "$ICONSET_DIR/icon_32x32.png"
cp "$COMMON_ICONS/pkvault_64x64.png" "$ICONSET_DIR/icon_32x32@2x.png"
cp "$COMMON_ICONS/pkvault_128x128.png" "$ICONSET_DIR/icon_128x128.png"
cp "$COMMON_ICONS/pkvault_256x256.png" "$ICONSET_DIR/icon_128x128@2x.png"
cp "$COMMON_ICONS/pkvault_256x256.png" "$ICONSET_DIR/icon_256x256.png"
# note: no icon_256x256@2x.png, would need a 512px source asset we don't have

if command -v iconutil >/dev/null 2>&1; then
  iconutil -c icns "$ICONSET_DIR" -o "$APP_DIR/Contents/Resources/pkvault.icns"
else
  python3 -m icnsutil compose -f "$APP_DIR/Contents/Resources/pkvault.icns" \
    "$ICONSET_DIR"/icon_16x16.png \
    "$ICONSET_DIR"/icon_16x16@2x.png \
    "$ICONSET_DIR"/icon_32x32.png \
    "$ICONSET_DIR"/icon_32x32@2x.png \
    "$ICONSET_DIR"/icon_128x128.png \
    "$ICONSET_DIR"/icon_128x128@2x.png \
    "$ICONSET_DIR"/icon_256x256.png
fi
rm -rf "$(dirname "$ICONSET_DIR")"

# ad-hoc sign (required on Apple Silicon)
if command -v codesign >/dev/null 2>&1; then
  codesign --force --deep --sign - "$APP_DIR"
elif command -v rcodesign >/dev/null 2>&1; then
  rcodesign sign "$APP_DIR"
else
  echo "WARNING: neither codesign nor rcodesign found, PKVault.app will be unsigned" >&2
fi

echo "=== PKVault.app created at $APP_DIR ==="
