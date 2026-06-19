import type { Player } from '@/types/game'
import { STATUS_EFFECT_INFO } from '@/types/game'
import { useGameStore } from '@/store/gameStore'

interface PlayerDetailProps {
  player: Player | null
  onClose: () => void
}

const ITEM_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  antidote: { label: '解药', color: '#34d399' },
  weapon: { label: '武器', color: '#f97316' },
  armor: { label: '防具', color: '#60a5fa' },
  consumable: { label: '消耗品', color: '#f59e0b' },
  quest: { label: '任务', color: '#a78bfa' },
}

export default function PlayerDetail({ player, onClose }: PlayerDetailProps) {
  const isSpectator = useGameStore((s) => s.isSpectator)
  const updatePlayerHp = useGameStore((s) => s.updatePlayerHp)
  const updatePlayerAp = useGameStore((s) => s.updatePlayerAp)
  const poisonDefinitions = useGameStore((s) => s.poisonDefinitions)

  if (!player) return null

  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100))
  const apPercent = Math.max(0, Math.min(100, (player.actionPoints / player.maxActionPoints) * 100))

  const disabledClass = isSpectator
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card-abyss relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl border-gold-glow p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-bone-400 hover:text-gold-400 transition-colors text-xl leading-none"
        >
          ✕
        </button>

        <header className="flex items-center gap-3 mb-6 pr-8">
          <h2 className="font-serif text-2xl font-bold text-gold-400 text-glow-gold">
            {player.name}
          </h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              player.isAlive
                ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30'
                : 'bg-blood-900/40 text-blood-300 border border-blood-500/30'
            }`}
          >
            {player.isAlive ? '存活' : '死亡'}
          </span>
        </header>

        <section className="mb-5">
          <h3 className="text-gold-500 text-sm font-serif tracking-wider mb-3 border-b border-gold-500/10 pb-1">
            生命体征
          </h3>

          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-blood-300">HP</span>
              <span className="text-blood-200 tabular-nums">
                {player.hp} / {player.maxHp}
              </span>
            </div>
            <div className="h-3 rounded-full bg-abyss-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blood-600 to-blood-400 transition-all duration-300"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gold-300">行动点</span>
              <span className="text-gold-200 tabular-nums">
                {player.actionPoints} / {player.maxActionPoints}
              </span>
            </div>
            <div className="h-3 rounded-full bg-abyss-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-700 to-gold-400 transition-all duration-300"
                style={{ width: `${apPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-bone-400">敏捷</span>
            <span className="text-gold-300 font-serif font-bold tabular-nums">{player.agility}</span>
          </div>
        </section>

        <section className="mb-5">
          <h3 className="text-gold-500 text-sm font-serif tracking-wider mb-3 border-b border-gold-500/10 pb-1">
            状态效果
          </h3>
          {player.statusEffects.length === 0 ? (
            <p className="text-bone-500 text-sm">无状态效果</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {player.statusEffects.map((effect) => {
                const info = STATUS_EFFECT_INFO[effect.type]
                if (!info) return null
                return (
                  <span
                    key={effect.type}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${info.color}15`,
                      color: info.color,
                      border: `1px solid ${info.color}30`,
                    }}
                  >
                    {info.icon} {info.label}
                    <span className="opacity-70">({effect.remainingTurns}回合)</span>
                  </span>
                )
              })}
            </div>
          )}
        </section>

        <section className="mb-5">
          <h3 className="text-gold-500 text-sm font-serif tracking-wider mb-3 border-b border-gold-500/10 pb-1">
            中毒状态
          </h3>
          {player.poisonStacks.length === 0 ? (
            <p className="text-bone-500 text-sm">未中毒</p>
          ) : (
            <div className="flex flex-col gap-2">
              {player.poisonStacks.map((stack, idx) => {
                const poisonDef = poisonDefinitions.find((d) => d.id === stack.poisonType)
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-abyss-600/30 px-3 py-2 text-xs border border-mystic-400/10"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: poisonDef?.color ?? '#a855f7' }}
                      />
                      <span className="text-mystic-50 font-medium">
                        {poisonDef?.name ?? stack.poisonType}
                      </span>
                      <span className="text-mystic-200">×{stack.doses} 剂</span>
                    </div>
                    <div className="flex items-center gap-3 text-bone-400">
                      <span>来源: {stack.source}</span>
                      <span>触发: 第{stack.triggerTurn}回合</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="mb-5">
          <h3 className="text-gold-500 text-sm font-serif tracking-wider mb-3 border-b border-gold-500/10 pb-1">
            背包物品
          </h3>
          {player.inventory.length === 0 ? (
            <p className="text-bone-500 text-sm">背包为空</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {player.inventory.map((item) => {
                const typeInfo = ITEM_TYPE_LABELS[item.type] ?? { label: item.type, color: '#94a3b8' }
                return (
                  <div
                    key={item.id}
                    className="rounded-lg bg-abyss-600/30 border border-gold-500/10 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-bone-100 text-sm font-medium">{item.name}</span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: `${typeInfo.color}20`,
                          color: typeInfo.color,
                        }}
                      >
                        {typeInfo.label}
                      </span>
                    </div>
                    <p className="text-bone-500 text-[11px] leading-snug">{item.description}</p>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="mb-5">
          <h3 className="text-gold-500 text-sm font-serif tracking-wider mb-3 border-b border-gold-500/10 pb-1">
            位置
          </h3>
          <p className="text-bone-100 text-sm">{player.position}</p>
        </section>

        <footer className="border-t border-gold-500/10 pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updatePlayerHp(player.id, 10)}
              disabled={isSpectator}
              className={`btn-gothic text-xs ${disabledClass}`}
            >
              回复HP +10
            </button>
            <button
              onClick={() => updatePlayerHp(player.id, -10)}
              disabled={isSpectator}
              className={`btn-danger text-xs ${disabledClass}`}
            >
              扣除HP -10
            </button>
            <button
              onClick={() => updatePlayerAp(player.id, 1)}
              disabled={isSpectator}
              className={`btn-gothic text-xs ${disabledClass}`}
            >
              追加行动点 +1
            </button>
            <button
              onClick={() => updatePlayerAp(player.id, -1)}
              disabled={isSpectator}
              className={`btn-danger text-xs ${disabledClass}`}
            >
              扣除行动点 -1
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
