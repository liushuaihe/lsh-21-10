import type { Player } from '@/types/game'
import { STATUS_EFFECT_INFO } from '@/types/game'

interface PlayerCardProps {
  player: Player
  onClick: () => void
}

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100))
  const apPercent = Math.max(0, Math.min(100, (player.actionPoints / player.maxActionPoints) * 100))

  return (
    <div
      onClick={onClick}
      className={`card-abyss border-gold-glow rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
        !player.isAlive ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3
          className={`font-serif font-bold text-sm ${
            !player.isAlive ? 'text-blood-300 line-through' : 'text-gold-400'
          }`}
        >
          {!player.isAlive && '💀 '}
          {player.name}
        </h3>
        <span className="text-bone-400 text-xs">{player.position}</span>
      </div>

      <div className="mb-1.5">
        <div className="flex items-center justify-between text-xs mb-0.5">
          <span className="text-blood-300">HP</span>
          <span className="text-blood-200 tabular-nums">
            {player.hp}/{player.maxHp}
          </span>
        </div>
        <div className="h-2 rounded-full bg-abyss-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blood-600 to-blood-400 transition-all duration-300"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-0.5">
          <span className="text-gold-300">AP</span>
          <span className="text-gold-200 tabular-nums">
            {player.actionPoints}/{player.maxActionPoints}
          </span>
        </div>
        <div className="h-2 rounded-full bg-abyss-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-700 to-gold-400 transition-all duration-300"
            style={{ width: `${apPercent}%` }}
          />
        </div>
      </div>

      {player.statusEffects.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {player.statusEffects.map((effect) => {
            const info = STATUS_EFFECT_INFO[effect.type]
            if (!info) return null
            return (
              <span
                key={effect.type}
                className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${info.color}20`,
                  color: info.color,
                  border: `1px solid ${info.color}40`,
                }}
              >
                {info.icon} {info.label}
              </span>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {player.poisonStacks.length > 0 && (
            <span className="text-mystic-50 text-xs font-medium">
              ☠️ ×{player.poisonStacks.length}
            </span>
          )}
          <span className="text-bone-400 text-[10px]">
            敏捷 {player.agility}
          </span>
        </div>
      </div>
    </div>
  )
}
