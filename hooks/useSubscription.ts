import * as React from 'react'

/**
 * Placeholder subscription hook.
 *
 * When the Soroban RPC integration is wired up, replace the body of this hook
 * with real event polling against the network configured in shared/contracts.ts.
 */
export function useSubscription(
  _contractId: string,
  _topic: string,
  _onEvent: (event: unknown) => void,
  _pollInterval = 5000
) {
  React.useEffect(() => {
    // TODO: implement Soroban event polling via @stellar/stellar-sdk
  }, [_contractId, _topic, _onEvent, _pollInterval])
}
