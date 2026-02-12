#!/bin/sh

set -e

xdg-desktop-menu forceupdate >/dev/null 2>&1 || true
update-desktop-database >/dev/null 2>&1 || true
