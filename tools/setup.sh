#!/usr/bin/env bash
# Installe les outils d'export des modèles 3D dans tools/vendor/ :
#   - Source2Viewer CLI (ValveResourceFormat), qui lit les .vpk de Deadlock
#     et exporte les modèles en .glb ;
#   - gltf-transform, qui compresse les .glb (meshopt + textures WebP).
# Mêmes versions que le pipeline de deadlock-api (scripts/build_version_and_upload.sh).
# Usage : bash tools/setup.sh
set -euo pipefail

VRF_RELEASE="20.1"
GLTF_TRANSFORM_VERSION="4.5.1"

TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENDOR="$TOOLS_DIR/vendor"
S2V_DIR="$VENDOR/source2viewer"
mkdir -p "$S2V_DIR"

# Version du CLI selon le système (macOS natif ou Linux).
case "$(uname -s)-$(uname -m)" in
    Darwin-arm64)  asset="cli-macos-arm64.zip" ;;
    Darwin-x86_64) asset="cli-macos-x64.zip" ;;
    Linux-aarch64) asset="cli-linux-arm64.zip" ;;
    Linux-x86_64)  asset="cli-linux-x64.zip" ;;
    *) echo "Système non géré : $(uname -s)-$(uname -m)" >&2; exit 1 ;;
esac
platform="${asset%.zip}"

# On garde un dossier par plateforme : le même dépôt peut servir sur le Mac et dans une VM Linux.
dest="$S2V_DIR/$platform"
if [ "$(cat "$dest/.version" 2>/dev/null)" != "$VRF_RELEASE" ]; then
    echo "Téléchargement de Source2Viewer CLI $VRF_RELEASE ($platform)…"
    tmp="$(mktemp -d)"
    curl -fsSL -o "$tmp/cli.zip" \
        "https://github.com/ValveResourceFormat/ValveResourceFormat/releases/download/$VRF_RELEASE/$asset"
    mkdir -p "$dest"
    unzip -oq "$tmp/cli.zip" -d "$dest"
    chmod +x "$dest/Source2Viewer-CLI"
    echo "$VRF_RELEASE" > "$dest/.version"
fi

if [ ! -x "$VENDOR/node_modules/.bin/gltf-transform" ]; then
    echo "Installation de gltf-transform $GLTF_TRANSFORM_VERSION…"
    npm install --silent --no-audit --no-fund --prefix "$VENDOR" "@gltf-transform/cli@$GLTF_TRANSFORM_VERSION"
fi

echo "Source2Viewer : $dest/Source2Viewer-CLI"
echo "gltf-transform : $VENDOR/node_modules/.bin/gltf-transform"
