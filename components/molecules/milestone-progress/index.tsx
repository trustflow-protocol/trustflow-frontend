import React from 'react'
import styles from './style.module.css'

export type MilestoneStatus = 'released' | 'current' | 'locked'

export interface MilestoneProgressItem {
  id: string
  title: string
  amount: string
  status: MilestoneStatus
  description?: string
  dueLabel?: string
}

export interface MilestoneProgressProps {
  milestones: MilestoneProgressItem[]
  title?: string
  summary?: string
}

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  released: 'Released',
  current: 'Locked - in review',
  locked: 'Locked',
}

function getStatusClass(status: MilestoneStatus) {
  if (status === 'released') return styles.released
  if (status === 'current') return styles.current
  return styles.locked
}

export function MilestoneProgress({
  milestones,
  title = 'Milestone release timeline',
  summary,
}: MilestoneProgressProps) {
  if (milestones.length === 0) {
    return null
  }

  const releasedCount = milestones.filter((milestone) => milestone.status === 'released').length
  const displaySummary =
    summary ?? `${releasedCount} of ${milestones.length} escrow tranches released`

  return (
    <section className={styles.wrapper} aria-labelledby="milestone-progress-heading">
      <div className={styles.header}>
        <div>
          <h3 id="milestone-progress-heading" className={styles.title}>
            {title}
          </h3>
          <p className={styles.summary}>{displaySummary}</p>
        </div>
        <span className={styles.count}>
          {releasedCount}/{milestones.length}
        </span>
      </div>

      <ol className={styles.timeline}>
        {milestones.map((milestone, index) => (
          <li key={milestone.id} className={styles.item}>
            <div className={styles.rail} aria-hidden="true">
              <span className={`${styles.dot} ${getStatusClass(milestone.status)}`}>
                {index + 1}
              </span>
              {index < milestones.length - 1 && (
                <span className={`${styles.line} ${getStatusClass(milestone.status)}`} />
              )}
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h4 className={styles.milestoneTitle}>{milestone.title}</h4>
                  {milestone.description && (
                    <p className={styles.description}>{milestone.description}</p>
                  )}
                </div>
                <div className={styles.meta}>
                  <span className={styles.amount}>{milestone.amount}</span>
                  <span className={`${styles.badge} ${getStatusClass(milestone.status)}`}>
                    {STATUS_LABELS[milestone.status]}
                  </span>
                </div>
              </div>
              {milestone.dueLabel && <p className={styles.dueLabel}>{milestone.dueLabel}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
