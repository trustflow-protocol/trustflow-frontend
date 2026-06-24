import { useEffect, useState, useCallback } from "react";
import { isConnected, getUserInfo, watchWallet } from "@stellar/freighter-api";

export interface AccountInfo {
  address: string;
  displayName: string;
}

/**
 * Returns the currently connected Freighter account, or `null` when no wallet
 * is connected. Updates automatically when the user switches profiles inside
 * the Freighter extension — no page refresh required.
 */
export function useAccount(): AccountInfo | null {
  const [address, setAddress] = useState<string | null>(null);

  const syncAccount = useCallback(async () => {
    const connected = await isConnected();
    if (!connected) {
      setAddress(null);
      return;
    }
    const user = await getUserInfo();
    setAddress(user?.publicKey ?? null);
  }, []);

  useEffect(() => {
    syncAccount();

    // watchWallet fires whenever the active Freighter account changes so we
    // update state without requiring a page refresh.
    const unsubscribe = watchWallet(() => { void syncAccount(); });
    return () => { unsubscribe?.(); };
  }, [syncAccount]);

  if (!address) return null;
  return {
    address,
    displayName: `${address.slice(0, 4)}...${address.slice(-4)}`,
  };
}
