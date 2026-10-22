/**
 * useWalletSync
 *
 * Synchronises Freighter wallet connection state across browser tabs using the
 * BroadcastChannel API.  When any tab connects, disconnects, or switches
 * accounts, all other open tabs pick up the change silently without polling.
 *
 * Message protocol (WalletSyncMessage)
 * ─────────────────────────────────────
 *  type: 'WALLET_CONNECTED'    – a tab has a connected account
 *  type: 'WALLET_DISCONNECTED' – a tab reports the wallet is disconnected
 *  type: 'WALLET_ACCOUNT_CHANGED' – the active account changed (conflict handling)
 *  type: 'REQUEST_STATE'       – a new tab asks other tabs for the current state
 *  type: 'STATE_RESPONSE'      – response carrying the current state
 *
 * All messages carry a `tabId` (random UUID generated once per tab) so each
 * tab can ignore its own broadcasts.
 *
 * SSR safety: BroadcastChannel is only instantiated inside useEffect, so
 * Next.js server-side rendering never touches the browser API.
 */

import { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WalletSyncMessageType =
  | "WALLET_CONNECTED"
  | "WALLET_DISCONNECTED"
  | "WALLET_ACCOUNT_CHANGED"
  | "REQUEST_STATE"
  | "STATE_RESPONSE";

export interface WalletSyncMessage {
  type: WalletSyncMessageType;
  /** Public key of the connected account, or null when disconnected. */
  address: string | null;
  /** Network passphrase reported by Freighter. */
  network: string | null;
  /** Unique identifier for the sending tab (prevents self-processing). */
  tabId: string;
}

export interface WalletSyncHandlers {
  /** Called when another tab reports a connection or state change. */
  onRemoteConnect: (address: string, network: string | null) => void;
  /** Called when another tab reports a disconnection. */
  onRemoteDisconnect: () => void;
  /** Called when another tab switches accounts (conflict resolution). */
  onRemoteAccountChange: (address: string, network: string | null) => void;
}

export interface WalletSyncControls {
  /** Broadcast that this tab has connected with the given address. */
  broadcastConnect: (address: string, network: string | null) => void;
  /** Broadcast that this tab has disconnected. */
  broadcastDisconnect: () => void;
  /** Broadcast that this tab has switched accounts. */
  broadcastAccountChange: (address: string, network: string | null) => void;
  /** Ask other tabs to report their current state (useful on mount). */
  requestState: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNEL_NAME = "trustflow:wallet-sync";

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Generate a random tab-scoped identifier. Falls back gracefully for old envs. */
function generateTabId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `tab-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Sets up a BroadcastChannel listener and returns helpers to broadcast wallet
 * state changes to other tabs.
 *
 * @param handlers Callbacks invoked when remote tabs send state-change messages.
 * @returns Controls for broadcasting this tab's state to other tabs.
 */
export function useWalletSync(handlers: WalletSyncHandlers): WalletSyncControls {
  // Stable ref so the effect closure always calls the latest handlers without
  // needing to re-subscribe the channel.
  const handlersRef = useRef<WalletSyncHandlers>(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  // Tab ID is stable for the lifetime of this page session.
  const tabIdRef = useRef<string>(generateTabId());

  // BroadcastChannel ref – created once on mount, closed on unmount.
  const channelRef = useRef<BroadcastChannel | null>(null);

  // ── Post a message to other tabs ──────────────────────────────────────────
  const post = useCallback(
    (type: WalletSyncMessageType, address: string | null, network: string | null) => {
      channelRef.current?.postMessage({
        type,
        address,
        network,
        tabId: tabIdRef.current,
      } satisfies WalletSyncMessage);
    },
    []
  );

  // ── Set up the channel and message handler ────────────────────────────────
  useEffect(() => {
    // BroadcastChannel is unavailable in Node / SSR – bail out silently.
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<WalletSyncMessage>) => {
      const msg = event.data;

      // Ignore messages from this same tab.
      if (!msg || msg.tabId === tabIdRef.current) return;

      const { onRemoteConnect, onRemoteDisconnect, onRemoteAccountChange } =
        handlersRef.current;

      switch (msg.type) {
        case "WALLET_CONNECTED":
        case "STATE_RESPONSE":
          if (msg.address) {
            onRemoteConnect(msg.address, msg.network);
          }
          break;

        case "WALLET_DISCONNECTED":
          onRemoteDisconnect();
          break;

        case "WALLET_ACCOUNT_CHANGED":
          if (msg.address) {
            onRemoteAccountChange(msg.address, msg.network);
          }
          break;

        case "REQUEST_STATE":
          // Another tab has just opened and wants our current state.
          // The response is handled by useAccount which re-broadcasts once it
          // knows the current address. Defer to avoid a race with mounting.
          break;

        default:
          break;
      }
    };

    // Ask other tabs to share their current state so this tab can hydrate
    // without waiting for the next 2-second Freighter poll.
    post("REQUEST_STATE", null, null);

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [post]);

  // ── Public broadcast helpers ──────────────────────────────────────────────

  const broadcastConnect = useCallback(
    (address: string, network: string | null) => {
      post("WALLET_CONNECTED", address, network);
    },
    [post]
  );

  const broadcastDisconnect = useCallback(() => {
    post("WALLET_DISCONNECTED", null, null);
  }, [post]);

  const broadcastAccountChange = useCallback(
    (address: string, network: string | null) => {
      post("WALLET_ACCOUNT_CHANGED", address, network);
    },
    [post]
  );

  const requestState = useCallback(() => {
    post("REQUEST_STATE", null, null);
  }, [post]);

  return {
    broadcastConnect,
    broadcastDisconnect,
    broadcastAccountChange,
    requestState,
  };
}
