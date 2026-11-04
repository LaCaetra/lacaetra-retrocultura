#!/usr/bin/env bash
# Compila el instalador de Windows (NSIS, .exe) desde Debian/Ubuntu/Fedora.
# Basado en la guía de Tauri «Windows Installer · Build on Linux and macOS».
#
# Requisitos (una sola vez):
#   sudo apt install nsis lld llvm clang         # Fedora: sudo dnf install mingw32-nsis lld llvm clang
#   rustup target add x86_64-pc-windows-msvc
#   cargo install --locked cargo-xwin
#
# cargo-xwin descarga la primera vez las bibliotecas de Windows que necesita.
set -euo pipefail
cd "$(dirname "$0")/.."
node build.mjs
cd targets/tauri
npx -y @tauri-apps/cli@2 build --runner cargo-xwin --target x86_64-pc-windows-msvc --bundles nsis
echo
ls -1 target/x86_64-pc-windows-msvc/release/bundle/nsis/*.exe
