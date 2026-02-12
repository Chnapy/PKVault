#!/bin/sh

set -e

# Install flatpak dependencies

echo "=== Building .flatpak for Linux x86_64 ==="

# Add the Flathub repository
flatpak --user remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo

# Add the GNOME runtime and SDK forx64
# Heavy install (>1Gb)
flatpak --user install --noninteractive org.gnome.Sdk/x86_64/49
flatpak --user install --noninteractive org.gnome.Platform/x86_64/49

# # Add the GNOME runtime and SDK for ARM64
# flatpak install org.gnome.Sdk/aarch64/45
# flatpak install org.gnome.Platform/aarch64/45
