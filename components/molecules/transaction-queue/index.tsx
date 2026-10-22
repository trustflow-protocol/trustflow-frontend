import React, { useState } from 'react'
import styles from './style.module.css'
import type { QueuedTransaction } from '../../../hooks/useTransactionQueue'

interface TransactionQueueProps {
  queue: QueuedTransaction[]
  pendingCount: number
  failedCount: number
  totalCount: number
  isProcessing: boolean
  onRemove: (id: string) => void
  onRetry: (id: string) => void
  onRetryAll: () => void
  onClearCompleted: () => void
  onClearAll: () => void
}

const STATUS_ICONS: Record<string, string> = {
  pending: '⏳',
  processing: '🔄',
  completed: '✅',
  failed: '❌',
}

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  release: 'Release Milestone',
  refund: 'Refund',
  open_dispute: 'Open Dispute',
  submit_evidence: 'Submit Evidence',
  vote_dispute: 'Vote on Dispute',
}

function formatDate(iso: string): string {
  try {
    const date = new Date(iso)
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function QueueItem({
  item,
  onRemove,
  onRetry,
}: {
  item: QueuedTransaction
  onRemove: (id: string) => void
  onRetry: (id: string) => void
}) {
  const isPending = item.status === 'pending'
  const isFailed = item.status === 'failed'
  const isCompleted = item.status === 'completed'
  const isProcessing = item.status === 'processing'

  return (
    <div
      className={`${styles.item} ${
        isFailed ? styles.itemFailed : ''
      } ${isCompleted ? styles.itemCompleted : ''} ${
        isProcessing ? styles.itemProcessing : ''
      }`}
    >
      <div className={styles.itemIcon}>
        {STATUS_ICONS[item.status] ?? '📋'}
      </div>

      <div className={styles.itemContent}>
        <div className={styles.itemHeader}>
          <span className={styles.itemType}>
            {TYPE_LABELS[item.type] ?? item.type}
          </span>
          <span className={styles.itemStatus}>
            {item.status === 'processing' && 'Processing…'}
            {item.status === 'pending' && 'Queued'}
            {item.status === 'completed' && 'Completed'}
            {item.status === 'failed' && `Failed (${item.retryCount}/${item.maxRetries})`}
          </span>
        </div>

        <span className={styles.itemLabel}>{item.label}</span>
        <span className={styles.itemDate}>{formatDate(item.createdAt)}</span>

        {item.error && (
          <span className={styles.itemError}>{item.error}</span>
        )}
      </div>

      <div className={styles.itemActions}>
        {isPending && !isProcessing && (
          <button
            className={styles.actionBtn}
            onClick={() => onRemove(item.id)}
            title="Remove from queue"
            aria-label={`Remove ${item.label} from queue`}
          >
            ✕
          </button>
        )}
        {isFailed && (
          <>
            <button
              className={`${styles.actionBtn} ${styles.retryBtn}`}
              onClick={() => onRetry(item.id)}
              title="Retry transaction"
              aria-label={`Retry ${item.label}`}
            >
              ↻ Retry
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => onRemove(item.id)}
              title="Remove from queue"
              aria-label={`Remove ${item.label} from queue`}
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function TransactionQueue({
  queue,
  pendingCount,
  failedCount,
  totalCount,
  isProcessing,
  onRemove,
  onRetry,
  onRetryAll,
  onClearCompleted,
  onClearAll,
}: TransactionQueueProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (totalCount === 0) return null

  const hasFailed = failedCount > 0
  const hasCompleted = queue.some((tx) => tx.status === 'completed')

  return (
    <div className={styles.wrapper}>
      {/* Queue summary bar */}
      <button
        className={styles.summary}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="Toggle transaction queue"
      >
        <div className={styles.summaryLeft}>
          <span className={styles.summaryIcon}>📋</span>
          <span className={styles.summaryTitle}>Transaction Queue</span>
          {isProcessing && (
            <span className={styles.processingBadge}>Processing…</span>
          )}
        </div>

        <div className={styles.summaryRight}>
          {pendingCount > 0 && (
            <span className={styles.badgePending}>{pendingCount} pending</span>
          )}
          {hasFailed && (
            <span className={styles.badgeFailed}>{failedCount} failed</span>
          )}
          {totalCount > 0 && !isProcessing && (
            <span className={styles.badgeTotal}>{totalCount} total</span>
          )}
          <span className={styles.expandIcon}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Expanded queue list */}
      {isExpanded && (
        <div className={styles.panel}>
          {/* Actions bar */}
          <div className={styles.actions}>
            {hasFailed && (
              <button
                className={`${styles.actionBtn} ${styles.retryAllBtn}`}
                onClick={onRetryAll}
                disabled={isProcessing}
              >
                ↻ Retry All Failed
              </button>
            )}
            {hasCompleted && (
              <button
                className={`${styles.actionBtn} ${styles.clearBtn}`}
                onClick={onClearCompleted}
              >
                ✓ Clear Completed
              </button>
            )}
            <button
              className={`${styles.actionBtn} ${styles.clearBtn}`}
              onClick={onClearAll}
            >
              ✕ Clear All
            </button>
          </div>

          {/* Queue items */}
          <div className={styles.list}>
            {queue.map((item) => (
              <QueueItem
                key={item.id}
                item={item}
                onRemove={onRemove}
                onRetry={onRetry}
              />
            ))}
          </div>

          {queue.length === 0 && (
            <div className={styles.empty}>
              <p>No transactions in queue.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
