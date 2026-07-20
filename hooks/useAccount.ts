/**
 * useAccount
 *
 * Manages the connected Freighter wallet state for this tab and keeps it in
 * sync with all other open tabs via the useWalletSync hook.
 *
 * Behaviour
 * ─────────
 * • On mount the hook asks Freighter for the current connection state.
 * • A 2-second interval re-checks Freighter to pick up changes made directly
 *   inside the extension (connect, disconnect, account switch).
 * • When a change is detected the new state is broadcast to other open tabs
 *   via BroadcastChannel so they update immediately instead of waiting for
 *   their next poll.
 * • When another tab reports a change, this tab's state is updated silently
 *   (no page reload, no user prompt) – auto-reconnect.
 * • If another tab switches to a different account (conflict), this tab also
 *   adopts the new account to stay consistent.
 * • The `network` field is exposed so consumers can gate features on the
 *   active Stellar network (testnet vs mainnet).
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { isConnected, getUserInfo } from "@stellar/freighter-api";
import { useWalletSync } from "./useWalletSync";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AccountInfo {
  address: string;
  displayName: string;
  /** Stellar network passphrase reported by Freighter, or null if unavailable. */
  network: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns the currently connected Freighter wallet account, or null when no
 * wallet is connected.  State is synchronised across browser tabs in real time.
 */
export function useAccount(): AccountInfo | null {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  // Track the previous address so we can detect account switches.
  const prevAddressRef = useRef<string | null>(null);

  // ── Apply new state ────────────────────────────────────────────────────────
  const applyState = useCallback((addr: string | null, net: string | null) => {
    setAddress(addr);
    setNetwork(net);
    prevAddressRef.current = addr;
  }, []);

  // ── Cross-tab sync via BroadcastChannel ───────────────────────────────────
  const { broadcastConnect, broadcastDisconnect, broadcastAccountChange } =
    useWalletSync({
      onRemoteConnect: (addr, net) => {
        // Another tab connected – adopt the same state silently (auto-reconnect).
        applyState(addr, net);
      },
      onRemoteDisconnect: () => {
        // Another tab disconnected – mirror the disconnection.
        applyState(null, null);
      },
      onRemoteAccountChange: (addr, net) => {
        // Another tab switched accounts – adopt the new account to stay consistent
        // (conflict resolution: last writer wins across tabs).
        applyState(addr, net);
      },
    });

  // ── Poll Freighter and broadcast detected changes ─────────────────────────
  const syncAccount = useCallback(async () => {
    try {
      const connected = await isConnected();

      if (!connected) {
        if (prevAddressRef.current !== null) {
          // We were connected before — broadcast the disconnection.
          broadcastDisconnect();
        }
        applyState(null, null);
        return;
      }

      const user = await getUserInfo();
      const newAddress = user?.publicKey ?? null;
      // getUserInfo also exposes networkPassphrase in newer versions;
      // fall back to null for compat with @stellar/freighter-api v1.5.x.
      const newNetwork =
        (user as unknown as Record<string, unknown>)?.networkPassphrase as
          | string
          | null ?? null;

      if (newAddress === null) {
        if (prevAddressRef.current !== null) {
          broadcastDisconnect();
        }
        applyState(null, null);
        return;
      }

      const previous = prevAddressRef.current;

      if (previous === null) {
        // Freshly connected.
        applyState(newAddress, newNetwork);
        broadcastConnect(newAddress, newNetwork);
      } else if (previous !== newAddress) {
        // Account switched within the extension.
        applyState(newAddress, newNetwork);
        broadcastAccountChange(newAddress, newNetwork);
      } else if (newNetwork !== network) {
        // Same account but network changed.
        setNetwork(newNetwork);
        broadcastConnect(newAddress, newNetwork);
      }
    } catch {
      // Freighter unavailable – silently keep the last known state rather than
      // immediately flashing a disconnected UI.
    }
  }, [
    applyState,
    broadcastConnect,
    broadcastDisconnect,
    broadcastAccountChange,
    network,
  ]);

  // ── Mount: initial sync + polling interval ────────────────────────────────
  useEffect(() => {
    syncAccount();
    const interval = setInterval(syncAccount, 2000);
    return () => clearInterval(interval);
  }, [syncAccount]);

  // ── Derived state ─────────────────────────────────────────────────────────
  if (!address) return null;

  return {
    address,
    displayName: `${address.slice(0, 4)}...${address.slice(-4)}`,
    network,
  };
}
