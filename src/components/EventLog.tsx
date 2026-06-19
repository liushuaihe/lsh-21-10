import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { GameEvent, GameEventType } from '@/types/game'

const TYPE_COLORS: Record<GameEventType, string> = {
  action: '#60a5fa',
  poison: '#a855f7',
  status: '#34d399',
  death: '#ef4444',
  system: '#d4a816',
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export default function EventLog() {
  const eventLog = useGameStore((s) => s.eventLog)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [eventLog.length])

  return (
    <div className="card-abyss border-gold-glow rounded-lg flex flex-col">
      <h2 className="font-serif text-gold-400 text-sm font-bold px-4 py-3 border-b border-gold-500/10">
        📜 事件日志
      </h2>

      <div
        className="overflow-y-auto px-4 py-2"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {eventLog.length === 0 && (
          <p className="text-bone-500 text-xs py-4 text-center">暂无事件</p>
        )}
        {eventLog.map((event: GameEvent) => (
          <div
            key={event.id}
            className="flex items-start gap-2 py-1.5 border-b border-abyss-300/30 last:border-b-0"
          >
            <span className="text-bone-500 text-[10px] tabular-nums shrink-0 pt-0.5">
              {formatTime(event.timestamp)}
            </span>
            <span
              className="text-xs leading-relaxed"
              style={{ color: TYPE_COLORS[event.type] }}
            >
              {event.description}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
