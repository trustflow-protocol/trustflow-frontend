import { useState, useRef, useEffect } from 'react';
import { setAllowed } from '@stellar/freighter-api';

interface WalletButtonProps {
  address: string;
  onDisconnect: () => void;
}

/**
 * Shows the connected wallet address and a dropdown with options to switch
 * accounts or disconnect. Clicking outside closes the menu.
 */
export function WalletButton({ address, onDisconnect }: WalletButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = `${address.slice(0, 4)}...${address.slice(-4)}`;

  function handleSwap() {
    setOpen(false);
    // Re-invoking setAllowed opens the Freighter permission popup so the user
    // can approve a different profile without disconnecting first.
    void setAllowed();
  }

  function handleDisconnect() {
    setOpen(false);
    onDisconnect();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
        {displayName}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-44 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 z-50"
        >
          <button
            role="menuitem"
            onClick={handleSwap}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Switch account
          </button>
          <button
            role="menuitem"
            onClick={handleDisconnect}
            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
