#!/usr/bin/env bash
set -euo pipefail
NETWORK=${NETWORK:-testnet}
echo "Seeding test data on $NETWORK..."
stellar keys generate --network "$NETWORK" test-deployer 2>/dev/null || true
stellar keys fund test-deployer --network "$NETWORK" 2>/dev/null || echo "Fund manually via Friendbot"
echo "✓ Seed complete"
