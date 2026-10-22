import { useState, useCallback, useEffect, useRef } from 'react'
import { useOnlineStatus } from './useOnlineStatus'
import { useEscrowContract } from './useEscrowContract'
import { useDisputeContract } from './useDisputeContract'

/* ─── Types ──────────────────────────────────────────────────── */

export type TransactionType =
  | 'deposit'
  | 'release'
  | 'refund'
  | 'open_dispute'
  | 'submit_evidence'
  | 'vote_dispute'

export type QueueItemStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface QueuedTransaction {
  /** Unique ID assigned at creation time (ISO string + counter). */
  id: string
  /** Which contract action this is. */
  type: TransactionType
  /** Human-readable label for UI display. */
  label: string
  /** Serialized parameters (safe for IndexedDB). */
  params: Record<string, unknown>
  /** When the transaction was first queued. */
  createdAt: string
  /** Latest status. */
  status: QueueItemStatus
  /** Error message if status === 'failed'. */
  error?: string
  /** How many times we've attempted to process this item. */
  retryCount: number
  /** Max retries before marking as permanently failed. */
  maxRetries: number
}

/** Optional toast functions the consuming component can provide. */
export interface QueueToastFunctions {
  info: (msg: string) => void
  error: (msg: string) => void
  warning: (msg: string) => void
}

/* ─── Constants ──────────────────────────────────────────────── */

const DB_NAME = 'trustflow-queue'
const DB_VERSION = 1
const STORE_NAME = 'transactions'
const MAX_RETRIES = 5

/* ─── IndexedDB helpers ─────────────────────────────────────── */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('status', 'status', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readAllFromDB(): Promise<QueuedTransaction[]> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()
      request.onsuccess = () => {
        const items = (request.result as QueuedTransaction[]).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        resolve(items)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    console.warn('[Queue] IndexedDB unavailable, using in-memory fallback:', err)
    return []
  }
}

async function writeToDB(item: QueuedTransaction): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put(item)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('[Queue] IndexedDB write failed:', err)
  }
}

async function deleteFromDB(id: string): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('[Queue] IndexedDB delete failed:', err)
  }
}

async function clearDB(): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('[Queue] IndexedDB clear failed:', err)
  }
}

/* ─── Queue ID generator ────────────────────────────────────── */

let counter = 0

function generateId(): string {
  return `tx-${Date.now()}-${++counter}`
}

/* ─── Hook ───────────────────────────────────────────────────── */

export interface UseTransactionQueueResult {
  /** All queued transactions, sorted oldest-first. */
  queue: QueuedTransaction[]
  /** Number of items currently pending or processing. */
  pendingCount: number
  /** Number of items that have failed. */
  failedCount: number
  /** Total number of items. */
  totalCount: number
  /** True while any item is being processed. */
  isProcessing: boolean
  /** Add a new transaction to the queue. */
  enqueue: (tx: Omit<QueuedTransaction, 'id' | 'createdAt' | 'status' | 'retryCount' | 'maxRetries'>) => Promise<void>
  /** Remove a single transaction from the queue. */
  remove: (id: string) => Promise<void>
  /** Retry a single failed transaction. */
  retry: (id: string) => Promise<void>
  /** Retry all failed transactions. */
  retryAll: () => Promise<void>
  /** Clear all completed transactions. */
  clearCompleted: () => Promise<void>
  /** Clear the entire queue. */
  clearAll: () => Promise<void>
  /** Immediately process all pending items (called automatically on reconnect). */
  processQueue: () => Promise<void>
}

/**
 * Offline-first persistent transaction queue backed by IndexedDB.
 *
 * - Queued transactions survive page reloads and browser restarts.
 * - Transactions are automatically processed when the user comes back online.
 * - Failed transactions can be retried individually or in bulk.
 * - Provide `toast` functions to show user-facing notifications.
 */
export function useTransactionQueue(toast?: QueueToastFunctions): UseTransactionQueueResult {
  const [queue, setQueue] = useState<QueuedTransaction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const isOnline = useOnlineStatus()
  const wasOffline = useRef(false)
  const processingRef = useRef(false)

  const escrow = useEscrowContract()
  const dispute = useDisputeContract()

  // ── Load from IndexedDB on mount ──────────────────────────────

  useEffect(() => {
    readAllFromDB().then(setQueue).catch((err) => {
      console.warn('[Queue] Failed to load from IndexedDB:', err)
    })
  }, [])

  // ── Auto-process when coming back online ──────────────────────

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true
      return
    }

    if (wasOffline.current) {
      wasOffline.current = false
      const pending = queue.filter((tx) => tx.status === 'pending' || tx.status === 'failed')
      if (pending.length > 0) {
        toast?.info(`Back online! Processing ${pending.length} queued transaction(s)…`)
        processQueueInternal()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline])

  // ── Execute the actual contract call ──────────────────────────

  async function executeTransaction(item: QueuedTransaction): Promise<void> {
    const { type, params } = item

    switch (type) {
      case 'deposit': {
        const { gigId, milestoneIndex, token, amount } = params as {
          gigId: number[]
          milestoneIndex: number
          token: string
          amount: string
        }
        await escrow.deposit(
          new Uint8Array(gigId) as unknown as Buffer,
          milestoneIndex,
          token,
          BigInt(amount)
        )
        break
      }

      case 'release': {
        const { gigId, milestoneIndex } = params as {
          gigId: number[]
          milestoneIndex: number
        }
        await escrow.release(
          new Uint8Array(gigId) as unknown as Buffer,
          milestoneIndex
        )
        break
      }

      case 'refund': {
        const { gigId, milestoneIndex } = params as {
          gigId: number[]
          milestoneIndex: number
        }
        await escrow.refund(
          new Uint8Array(gigId) as unknown as Buffer,
          milestoneIndex
        )
        break
      }

      case 'open_dispute': {
        const { gigId, milestoneIndex, reason } = params as {
          gigId: number[]
          milestoneIndex: number
          reason: string
        }
        await dispute.openDispute(
          new Uint8Array(gigId) as unknown as Buffer,
          milestoneIndex,
          reason
        )
        break
      }

      case 'submit_evidence': {
        const { disputeId, evidenceUri } = params as {
          disputeId: number[]
          evidenceUri: string
        }
        await dispute.submitEvidence(
          new Uint8Array(disputeId) as unknown as Buffer,
          evidenceUri
        )
        break
      }

      case 'vote_dispute': {
        const { disputeId, inFavor } = params as {
          disputeId: number[]
          inFavor: boolean
        }
        await dispute.vote(
          new Uint8Array(disputeId) as unknown as Buffer,
          inFavor
        )
        break
      }

      default:
        throw new Error(`Unknown transaction type: ${type}`)
    }
  }

  // ── Process a single item ─────────────────────────────────────

  async function processSingle(item: QueuedTransaction): Promise<void> {
    if (!navigator.onLine) return

    // Mark as processing
    const processing: QueuedTransaction = { ...item, status: 'processing' }
    await writeToDB(processing)
    setQueue((prev) => prev.map((tx) => (tx.id === item.id ? processing : tx)))

    try {
      await executeTransaction(item)

      // Mark as completed
      const completed: QueuedTransaction = { ...item, status: 'completed' }
      await writeToDB(completed)
      setQueue((prev) => prev.map((tx) => (tx.id === item.id ? completed : tx)))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed'
      const newRetryCount = item.retryCount + 1
      const isPermanentlyFailed = newRetryCount >= item.maxRetries

      const failed: QueuedTransaction = {
        ...item,
        status: isPermanentlyFailed ? 'failed' : 'pending',
        error: message,
        retryCount: newRetryCount,
      }
      await writeToDB(failed)
      setQueue((prev) => prev.map((tx) => (tx.id === item.id ? failed : tx)))

      if (isPermanentlyFailed) {
        toast?.error(`Transaction failed permanently: ${item.label} — ${message}`)
      } else {
        toast?.warning(`Transaction failed (retry ${newRetryCount}/${item.maxRetries}): ${item.label}`)
      }
    }
  }

  // ── Process the entire queue ──────────────────────────────────

  const processQueueInternal = useCallback(async () => {
    if (processingRef.current) return
    if (!navigator.onLine) return

    processingRef.current = true
    setIsProcessing(true)

    try {
      const items = await readAllFromDB()
      const pending = items.filter(
        (tx) => tx.status === 'pending' || tx.status === 'failed'
      )

      for (const item of pending) {
        if (!navigator.onLine) break
        await processSingle(item)
      }
    } catch (err) {
      console.error('[Queue] Processing error:', err)
    } finally {
      processingRef.current = false
      setIsProcessing(false)
    }
  }, [escrow, dispute])

  // ── Enqueue ───────────────────────────────────────────────────

  const enqueue = useCallback(
    async (input: Omit<QueuedTransaction, 'id' | 'createdAt' | 'status' | 'retryCount' | 'maxRetries'>) => {
      const item: QueuedTransaction = {
        ...input,
        id: generateId(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        retryCount: 0,
        maxRetries: MAX_RETRIES,
      }

      await writeToDB(item)
      setQueue((prev) => [...prev, item])

      toast?.info(`Transaction queued: ${input.label}`)

      // If we're online, try to process immediately
      if (navigator.onLine) {
        await processSingle(item)
      }
    },
    [toast]
  )

  // ── Remove ────────────────────────────────────────────────────

  const remove = useCallback(async (id: string) => {
    await deleteFromDB(id)
    setQueue((prev) => prev.filter((tx) => tx.id !== id))
  }, [])

  // ── Retry single ──────────────────────────────────────────────

  const retry = useCallback(
    async (id: string) => {
      const item = queue.find((tx) => tx.id === id)
      if (!item) return

      const updated: QueuedTransaction = { ...item, status: 'pending', error: undefined }
      await writeToDB(updated)
      setQueue((prev) => prev.map((tx) => (tx.id === id ? updated : tx)))

      await processSingle(updated)
    },
    [queue]
  )

  // ── Retry all ─────────────────────────────────────────────────

  const retryAll = useCallback(async () => {
    const failed = queue.filter((tx) => tx.status === 'failed')
    if (failed.length === 0) return

    for (const item of failed) {
      const updated: QueuedTransaction = { ...item, status: 'pending', error: undefined }
      await writeToDB(updated)
    }

    setQueue((prev) => prev.map((tx) => (tx.status === 'failed' ? { ...tx, status: 'pending', error: undefined } : tx)))

    await processQueueInternal()
  }, [queue, processQueueInternal])

  // ── Clear completed ───────────────────────────────────────────

  const clearCompleted = useCallback(async () => {
    const completed = queue.filter((tx) => tx.status === 'completed')
    for (const item of completed) {
      await deleteFromDB(item.id)
    }
    setQueue((prev) => prev.filter((tx) => tx.status !== 'completed'))
  }, [queue])

  // ── Clear all ─────────────────────────────────────────────────

  const clearAll = useCallback(async () => {
    await clearDB()
    setQueue([])
  }, [])

  // ── Computed values ───────────────────────────────────────────

  const pendingCount = queue.filter(
    (tx) => tx.status === 'pending' || tx.status === 'processing'
  ).length

  const failedCount = queue.filter((tx) => tx.status === 'failed').length

  return {
    queue,
    pendingCount,
    failedCount,
    totalCount: queue.length,
    isProcessing,
    enqueue,
    remove,
    retry,
    retryAll,
    clearCompleted,
    clearAll,
    processQueue: processQueueInternal,
  }
}
