import React, { FunctionComponent } from 'react'
import { Card, ConnectButton, Loading, ProgressBar } from '../../atoms'
import { MilestoneProgress, type MilestoneProgressItem } from '../../molecules'
import { Spacer } from '../../atoms/spacer'
import { Utils } from '../../../shared/utils'
import { useAccount } from '../../../hooks'

/**
 * EscrowPanel — replaces the old Soroban crowdfund Pledge component.
 *
 * Displays a placeholder escrow status card.
 * Wire up to the TrustFlow smart contract once RPC integration is ready.
 */
const EscrowPanel: FunctionComponent = () => {
  const account = useAccount()

  // TODO: fetch real escrow state from contract
  const mockEscrow = {
    balance: BigInt(250_0000000),
    target:  BigInt(1000_0000000),
    decimals: 7,
    symbol: 'XLM',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    loaded: true,
    milestones: [
      {
        id: 'brief',
        title: 'Project brief approved',
        amount: '150 XLM',
        status: 'released',
        description: 'Client approved the brief and the first tranche was released.',
        dueLabel: 'Released after kickoff approval',
      },
      {
        id: 'build',
        title: 'Implementation review',
        amount: '500 XLM',
        status: 'current',
        description: 'Funds remain locked until the active deliverable is accepted.',
        dueLabel: 'Current escrow checkpoint',
      },
      {
        id: 'handoff',
        title: 'Final handoff',
        amount: '350 XLM',
        status: 'locked',
        description: 'Final tranche stays locked until completion is confirmed.',
        dueLabel: 'Queued after implementation review',
      },
    ] satisfies MilestoneProgressItem[],
  }

  const { balance, target, decimals, symbol, deadline, loaded, milestones } = mockEscrow

  return (
    <Card>
      {!loaded ? (
        <Loading size={64} />
      ) : (
        <>
          <h6>ESCROWED</h6>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0' }}>
            {Utils.formatAmount(balance, decimals)} {symbol}
          </div>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {`of ${Utils.formatAmount(target, decimals)} ${symbol} goal`}
          </span>
          <Spacer rem={1} />
          <ProgressBar value={Utils.percentage(balance, target, decimals)} />
          <MilestoneProgress
            milestones={milestones}
            summary="1 tranche released; 2 tranches remain locked in escrow."
          />
          <Spacer rem={1.5} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h6>Time Remaining</h6>
              <span>{Utils.getRemainingTime(deadline)}</span>
            </div>
            <div>
              <h6>Status</h6>
              <span>Active</span>
            </div>
          </div>
          <Spacer rem={1.5} />
          {account ? (
            <button
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => alert('Contract integration coming soon')}
            >
              Release Milestone →
            </button>
          ) : (
            <ConnectButton label="Connect wallet to interact" isHigher={true} />
          )}
        </>
      )}
    </Card>
  )
}

export { EscrowPanel as Pledge }
