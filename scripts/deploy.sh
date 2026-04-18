#!/usr/bin/env bash
set -euo pipefail
NETWORK=${NETWORK:-testnet}
echo "Deploying TrustFlow contracts to $NETWORK..."
cd contracts
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/trustflow_core.wasm \
  --source deployer \
  --network "$NETWORK"
echo "✓ Contract deployed"
