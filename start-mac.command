#!/bin/bash
cd "$(dirname "$0")"
echo "========================================================"
echo " Starting PrintCraft 3D Fabrication Platform on macOS..."
echo "========================================================"
open http://localhost:3000
npm run dev
