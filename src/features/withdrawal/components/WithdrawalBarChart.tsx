import React from 'react'
import { Box, Text } from '@mantine/core'

interface HistoryItem {
  date: string 
  amount: number
}

interface Props {
  data: HistoryItem[]
  dark?: boolean
  width?: number
  height?: number
}

export const WithdrawalBarChart: React.FC<Props> = ({ data = [], dark = false, width = 360, height = 160 }) => {
  const map = new Map<string, number>()
  data.forEach((d) => {
    if (!d) return
    const rawDate = d.date || ''
    let key = ''
    const parsed = new Date(rawDate)
    if (!isNaN(parsed.getTime())) {
      key = parsed.toISOString().slice(0, 10)
    } else if (typeof rawDate === 'string' && rawDate.length >= 10) {
      key = rawDate.slice(0, 10)
    } else {
      key = rawDate || 'unknown'
    }

    const amountNum = Number(d.amount || 0) || 0
    map.set(key, (map.get(key) || 0) + amountNum)
  })

  const items = Array.from(map.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  // take last 7
  const last = items.slice(-7)

  const amounts = last.map((d) => d.amount)
  const max = Math.max(1, ...(amounts.length ? amounts : [1]))

  const padding = 12
  const chartW = width - padding * 2
  const chartH = height - 40
  const barGap = 8
  const barCount = Math.max(1, last.length)
  const barW = Math.max(8, (chartW - barGap * (barCount - 1)) / barCount)

  const barColor = dark ? '#10b981' : '#059669'
  const bg = dark ? '#0d0d0d' : '#ffffff'

  return (
    <Box style={{ width, background: bg, borderRadius: 12, padding: 8 }}>
      <Text style={{ marginBottom: 6, color: dark ? '#fff' : '#0f172a', fontWeight: 700, fontSize: 14 }}>
        Ringkasan Pencairan
      </Text>
      <svg width={width} height={height} role="img" aria-label="Withdrawal chart">
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
        {last.length === 0 ? (
          <text x={width / 2} y={height / 2} textAnchor="middle" fill={dark ? '#9ca3af' : '#64748b'}>Belum ada data</text>
        ) : (
          last.map((d, i) => {
            const x = padding + i * (barW + barGap)
            const h = (d.amount / max) * chartH
            const y = padding + (chartH - h)
            const label = d.date.slice(5).replace('-', '/')
            return (
              <g key={d.date}>
                <title>{`${label} — Rp ${Number(d.amount).toLocaleString('id-ID')}`}</title>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={4}
                  fill={barColor}
                  opacity={0.95}
                  style={{ cursor: 'pointer' }}
                />
                <text x={x + barW / 2} y={height - 8} fontSize={10} fill={dark ? '#d1d5db' : '#475569'} textAnchor="middle">
                  {label}
                </text>
              </g>
            )
          })
        )}
      </svg>
    </Box>
  )
}

export default WithdrawalBarChart
