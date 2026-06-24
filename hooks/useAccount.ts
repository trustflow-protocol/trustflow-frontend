import { useEffect, useState, useCallback } from "react";
import { isConnected, getUserInfo } from "@stellar/freighter-api";

export interface AccountInfo {
  address: string;
  displayName: string;
}

export function useAccount(): AccountInfo | null {
  const [address, setAddress] = useState<string | null>(null);

  const syncAccount = useCallback(async () => {
    try {
      const connected = await isConnected();
      if (!connected) {
        setAddress(null);
        return;
      }
      const user = await getUserInfo();
      setAddress(user?.publicKey ?? null);
    } catch {
      setAddress(null);
    }
  }, []);

  useEffect(() => {
    syncAccount();
    const interval = setInterval(syncAccount, 2000);
    return () => clearInterval(interval);
  }, [syncAccount]);

  if (!address) return null;
  return {
    address,
    displayName: `${address.slice(0, 4)}...${address.slice(-4)}`,
  };
}
