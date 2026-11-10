import React from 'react'

interface Props {
  score: number        // 0–100
  level: string        // LOW, MEDIUM, HIGH, CRITICAL
}

export default function RiskGauge({ score, level }: Props) {
  const pct = Math.min(100, Math.max(0, score))
  const colors = {
    LOW: { bar: '#16a34a', bg: '#dcfce7', text: '#15803d' },
    MEDIUM: { bar: '#d97706', bg: '#fef3c7', text: '#92400e' },
    HIGH: { bar: '#ea580c', bg: '#ffedd5', text: '#9a3412' },
    CRITICAL: { bar: '#dc2626', bg: '#fee2e2', text: '#991b1b' },
  }
  const c = colors[level as keyof typeof colors] || colors.MEDIUM

  return (
    <div className="rounded-xl p-4 border" style={{ backgroundColor: c.bg, borderColor: c.bar + '55' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm" style={{ color: c.text }}>Risk Level</span>
        <span className="font-bold text-xl" style={{ color: c.bar }}>{level}</span>
      </div>
      <div className="w-full bg-white rounded-full h-4 overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: c.bar }}
        />
      </div>
      <div className="text-right">
        <span className="text-2xl font-bold" style={{ color: c.bar }}>{pct.toFixed(1)}</span>
        <span className="text-sm ml-1" style={{ color: c.text }}>/100</span>
      </div>
    </div>
  )
}
