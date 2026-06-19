import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import PlayerCard from '@/components/PlayerCard'
import EventLog from '@/components/EventLog'
import PlayerDetail from '@/components/PlayerDetail'
import type { Player } from '@/types/game'
import { Plus, Skull } from 'lucide-react'

const PHASE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  action: { label: '行动阶段', color: 'text-gold-400', bg: 'bg-gold-500/20 border-gold-500/40' },
  conflict: { label: '冲突检测', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/40' },
  settlement: { label: '清算执行', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40' },
  complete: { label: '回合完成', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
}

export default function Home() {
  const players = useGameStore((s) => s.players)
  const currentTurn = useGameStore((s) => s.currentTurn)
  const currentPhase = useGameStore((s) => s.currentPhase)
  const isSpectator = useGameStore((s) => s.isSpectator)
  const addPlayer = useGameStore((s) => s.addPlayer)
  const startNewTurn = useGameStore((s) => s.startNewTurn)
  const executeSettlement = useGameStore((s) => s.executeSettlement)
  const completeTurn = useGameStore((s) => s.completeTurn)
  const resetGame = useGameStore((s) => s.resetGame)

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [maxHpInput, setMaxHpInput] = useState('100')
  const [maxApInput, setMaxApInput] = useState('5')
  const [agilityInput, setAgilityInput] = useState('5')

  const aliveCount = players.filter((p) => p.isAlive).length
  const deadCount = players.filter((p) => !p.isAlive).length
  const phaseConfig = PHASE_CONFIG[currentPhase] ?? PHASE_CONFIG.complete

  const canAddPlayer = currentPhase === 'complete' && currentTurn === 0 && !isSpectator

  const disabledClass = isSpectator
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : ''

  function handleAddPlayer() {
    const name = nameInput.trim()
    if (!name) return
    addPlayer(name, Number(maxHpInput) || 100, Number(maxApInput) || 5, Number(agilityInput) || 5)
    setNameInput('')
    setMaxHpInput('100')
    setMaxApInput('5')
    setAgilityInput('5')
  }

  function handleResetGame() {
    if (window.confirm('确定要重置游戏吗？所有数据将被清除！')) {
      resetGame()
    }
  }

  return (
    <div className="min-h-screen">
      {selectedPlayer && (
        <PlayerDetail player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

      <div className="card-abyss border-gold-glow rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <span className="font-serif text-3xl font-bold text-gold-400 text-glow-gold tabular-nums">
              第 {currentTurn} 回合
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium border ${phaseConfig.bg} ${phaseConfig.color}`}
            >
              {phaseConfig.label}
            </span>
            <span className="text-bone-300 text-sm">
              存活: <span className="text-gold-300 font-serif font-bold">{aliveCount}</span> / {players.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentPhase === 'complete' && (
              <button onClick={startNewTurn} disabled={isSpectator} className={`btn-gothic text-sm ${disabledClass}`}>
                开始新回合
              </button>
            )}
            {(currentPhase === 'action' || currentPhase === 'conflict') && (
              <button onClick={executeSettlement} disabled={isSpectator} className={`btn-gothic text-sm ${disabledClass}`}>
                执行清算
              </button>
            )}
            {currentPhase === 'settlement' && (
              <button onClick={completeTurn} disabled={isSpectator} className={`btn-gothic text-sm ${disabledClass}`}>
                结束回合
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card-abyss border-gold-glow rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetGame}
              disabled={isSpectator}
              className={`btn-danger text-xs flex items-center gap-1.5 ${disabledClass}`}
            >
              <Skull className="w-3.5 h-3.5" />
              重置游戏
            </button>
            {deadCount > 0 && (
              <span className="text-blood-300 text-xs font-serif flex items-center gap-1">
                💀 已死亡: {deadCount}
              </span>
            )}
          </div>
          {canAddPlayer && (
            <button
              onClick={() => setShowAddPlayer(!showAddPlayer)}
              disabled={isSpectator}
              className={`btn-gothic text-xs flex items-center gap-1.5 ${disabledClass}`}
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddPlayer ? '收起' : '添加玩家'}
            </button>
          )}
        </div>

        {canAddPlayer && showAddPlayer && (
          <div className="mt-3 pt-3 border-t border-gold-500/10">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-bone-400 text-[11px]">名称</label>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  disabled={isSpectator}
                  className={`input-gothic text-sm w-32 ${disabledClass}`}
                  placeholder="玩家名"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-bone-400 text-[11px]">最大HP</label>
                <input
                  type="number"
                  value={maxHpInput}
                  onChange={(e) => setMaxHpInput(e.target.value)}
                  disabled={isSpectator}
                  className={`input-gothic text-sm w-20 ${disabledClass}`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-bone-400 text-[11px]">最大AP</label>
                <input
                  type="number"
                  value={maxApInput}
                  onChange={(e) => setMaxApInput(e.target.value)}
                  disabled={isSpectator}
                  className={`input-gothic text-sm w-20 ${disabledClass}`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-bone-400 text-[11px]">敏捷</label>
                <input
                  type="number"
                  value={agilityInput}
                  onChange={(e) => setAgilityInput(e.target.value)}
                  disabled={isSpectator}
                  className={`input-gothic text-sm w-20 ${disabledClass}`}
                />
              </div>
              <button onClick={handleAddPlayer} disabled={isSpectator} className={`btn-gothic text-sm ${disabledClass}`}>
                添加玩家
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {players.length === 0 ? (
            <div className="card-abyss border-gold-glow rounded-lg p-8 text-center">
              <p className="text-bone-500 font-serif">尚无玩家，请先添加玩家</p>
            </div>
          ) : (
            <div
              className={`grid gap-3 ${
                players.length >= 4 ? 'grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onClick={() => setSelectedPlayer(player)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-80 shrink-0">
          <EventLog />
        </div>
      </div>
    </div>
  )
}
