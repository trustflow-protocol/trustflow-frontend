import React from 'react'
import { Spacer } from '../../atoms/spacer'
import { Utils } from '../../../shared/utils'

export interface IDepositsProps {
  address: string
  decimals: number
  name?: string
  symbol?: string
}

/**
 * Deposits — shows the user's escrowed balance.
 *
 * TODO: fetch real balance from the TrustFlow contract once RPC integration
 * is wired up in shared/contracts.ts.
 */
export function Deposits(props: IDepositsProps) {
  // Placeholder — will be replaced with contract call
  const balance = BigInt(0)

  if (Number(balance) <= 0) {
    return <React.Fragment />
  }

  return (
    <>
      <Spacer rem={2} />
      <h6>You&apos;ve Deposited</h6>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {Utils.formatAmount(balance, props.decimals)}{' '}
          <span title={props.name}>{props.symbol}</span>
        </span>
      </div>
    </>
  )
}
