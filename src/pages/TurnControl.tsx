import { useState, useMemo } from 'react'
import { useGameStore } from '@/store/gameStore'
import { COMMAND_TYPE_INFO, CommandType } from '@/types/game'
import { Swords, ArrowUp, ArrowDown, Trash2, Play, CheckCircle, AlertTriangle } from 'lucide-react'

const DEFAULT_COST: Record<CommandType, number> = {
  move: 1,
  investigate: 1,
  poison: 2,
  useItem: 1,
  defend: 1,
  custom: 1,
}

const PHASE_LABELS: Record<string, string> = {
  action: '行动阶段',
  conflict: '冲突检测',
  settlement: '结算阶段',
  complete: '回合结束',
}

export default function TurnControl() {
  const players = useGameStore((s) => s.players)
  const currentTurn = useGameStore((s) => s.currentTurn)
  const currentPhase = useGameStore((s) => s.currentPhase)
  const isSpectator = useGameStore((s) => s.isSpectator)
  const commands = useGameStore((s) => s.commands)
  const poisonDefinitions = useGameStore((s) => s.poisonDefinitions)
  const updatePlayerAp = useGameStore((s) => s.updatePlayerAp)
  const submitCommand = useGameStore((s) => s.submitCommand)
  const removeCommand = useGameStore((s) => s.removeCommand)
  const reorderCommand = useGameStore((s) => s.reorderCommand)
  const resolveConflicts = useGameStore((s) => s.resolveConflicts)
  const executeSettlement = useGameStore((s) => s.executeSettlement)
  const completeTurn = useGameStore((s) => s.completeTurn)
  const startNewTurn = useGameStore((s) => s.startNewTurn)

  const alivePlayers = useMemo(() => players.filter((p) => p.isAlive), [players])
  const aliveCount = alivePlayers.length

  const disabledClass = isSpectator
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : ''

  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [cmdType, setCmdType] = useState<CommandType>('move')
  const [cost, setCost] = useState(1)
  const [targetId, setTargetId] = useState('')
  const [description, setDescription] = useState('')
  const [poisonType, setPoisonType] = useState(poisonDefinitions[0]?.id ?? '')
  const [doses, setDoses] = useState(1)

  const handleTypeChange = (type: CommandType) => {
    setCmdType(type)
    setCost(DEFAULT_COST[type])
    if (type !== 'poison') {
      setPoisonType(poisonDefinitions[0]?.id ?? '')
      setDoses(1)
    }
  }

  const handleSubmitCommand = () => {
    if (!selectedPlayerId) return
    const player = players.find((p) => p.id === selectedPlayerId)
    if (!player) return
    const target = targetId ? players.find((p) => p.id === targetId) : undefined

    const params: Record<string, unknown> = {}
    if (cmdType === 'poison') {
      params.poisonType = poisonType
      params.doses = doses
    }

    submitCommand({
      playerId: player.id,
      playerName: player.name,
      type: cmdType,
      cost,
      target: targetId || undefined,
      targetName: target?.name,
      params,
      submittedAt: Date.now(),
      description: description || COMMAND_TYPE_INFO[cmdType].label,
    })

    setDescription('')
  }

  const sortedCommands = useMemo(
    () => [...commands].sort((a, b) => b.priority - a.priority),
    [commands]
  )

  const conflicts = useMemo(() => {
    const targetMap = new Map<string, string[]>()
    for (const cmd of commands) {
      if (cmd.target) {
        const arr = targetMap.get(cmd.target) || []
        arr.push(cmd.id)
        targetMap.set(cmd.target, arr)
      }
    }
    const conflictIds = new Set<string>()
    for (const [, ids] of targetMap) {
      if (ids.length > 1) {
        ids.forEach((id) => conflictIds.add(id))
      }
    }
    return conflictIds
  }, [commands])

  const resolvedOrder = useMemo(() => resolveConflicts(), [resolveConflicts])

  return (
    <div className="flex flex-col gap-6">
      <div className="card-abyss border-gold-glow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Swords className="text-gold-500" size={24} />
            <div>
              <h1 className="font-serif text-xl font-bold text-gold-400 text-glow-gold">
                回合控制中心
              </h1>
              <p className="text-bone-400 text-xs mt-0.5">管理行动点 · 提交指令 · 解决冲突</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-bone-500 text-xs">回合</p>
              <p className="text-gold-400 font-serif font-bold tabular-nums">{currentTurn}</p>
            </div>
            <div className="text-center">
              <p className="text-bone-500 text-xs">阶段</p>
              <p className="text-gold-300 font-serif">{PHASE_LABELS[currentPhase] ?? currentPhase}</p>
            </div>
            <div className="text-center">
              <p className="text-bone-500 text-xs">存活</p>
              <p className="text-gold-300 font-serif tabular-nums">{aliveCount}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="card-abyss border-gold-glow rounded-lg p-5">
        <h2 className="font-serif text-lg font-bold text-gold-400 mb-4">⚡ 行动点分配</h2>
        <div className="flex flex-col gap-3">
          {alivePlayers.map((player) => {
            const apPercent = (player.actionPoints / player.maxActionPoints) * 100
            return (
              <div key={player.id} className="flex items-center gap-3 rounded-lg bg-abyss-600/30 border border-gold-500/10 px-4 py-3">
                <span className="text-gold-400 font-serif font-bold text-sm min-w-[80px]">{player.name}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gold-300">AP</span>
                    <span className="text-gold-200 tabular-nums">{player.actionPoints}/{player.maxActionPoints}</span>
                  </div>
                  <div className="h-2 rounded-full bg-abyss-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-700 to-gold-400 transition-all duration-300"
                      style={{ width: `${apPercent}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updatePlayerAp(player.id, -1)}
                    disabled={isSpectator}
                    className={`btn-gothic px-2 py-1 text-xs ${disabledClass}`}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => updatePlayerAp(player.id, 1)}
                    disabled={isSpectator}
                    className={`btn-gothic px-2 py-1 text-xs ${disabledClass}`}
                  >
                    <ArrowUp size={14} />
                  </button>
                </div>
              </div>
            )
          })}
          {alivePlayers.length === 0 && (
            <p className="text-bone-500 text-sm text-center py-4">暂无存活玩家</p>
          )}
        </div>
      </section>

      {currentPhase === 'action' && (
        <section className="card-abyss border-gold-glow rounded-lg p-5">
          <h2 className="font-serif text-lg font-bold text-gold-400 mb-4">📋 提交行动指令</h2>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-bone-400 text-xs mb-1 block">玩家</label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  disabled={isSpectator}
                  className={`input-gothic w-full rounded text-sm ${disabledClass}`}
                >
                  <option value="">选择玩家</option>
                  {alivePlayers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (AP: {p.actionPoints})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-bone-400 text-xs mb-1 block">指令类型</label>
                <select
                  value={cmdType}
                  onChange={(e) => handleTypeChange(e.target.value as CommandType)}
                  disabled={isSpectator}
                  className={`input-gothic w-full rounded text-sm ${disabledClass}`}
                >
                  {(Object.keys(COMMAND_TYPE_INFO) as CommandType[]).map((type) => (
                    <option key={type} value={type}>{COMMAND_TYPE_INFO[type].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-bone-400 text-xs mb-1 block">消耗 AP</label>
                <input
                  type="number"
                  min={1}
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  disabled={isSpectator}
                  className={`input-gothic w-full rounded text-sm tabular-nums ${disabledClass}`}
                />
              </div>
              <div>
                <label className="text-bone-400 text-xs mb-1 block">目标玩家 (可选)</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  disabled={isSpectator}
                  className={`input-gothic w-full rounded text-sm ${disabledClass}`}
                >
                  <option value="">无</option>
                  {alivePlayers
                    .filter((p) => p.id !== selectedPlayerId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>
            </div>
            {cmdType === 'poison' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-bone-400 text-xs mb-1 block">毒药类型</label>
                  <select
                    value={poisonType}
                    onChange={(e) => setPoisonType(e.target.value)}
                    disabled={isSpectator}
                    className={`input-gothic w-full rounded text-sm ${disabledClass}`}
                  >
                    {poisonDefinitions.map((def) => (
                      <option key={def.id} value={def.id}>{def.name} (伤害:{def.damagePerDose}/剂)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-bone-400 text-xs mb-1 block">剂量</label>
                  <input
                    type="number"
                    min={1}
                    value={doses}
                    onChange={(e) => setDoses(Number(e.target.value))}
                    disabled={isSpectator}
                    className={`input-gothic w-full rounded text-sm tabular-nums ${disabledClass}`}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-bone-400 text-xs mb-1 block">描述</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="行动描述..."
                disabled={isSpectator}
                className={`input-gothic w-full rounded text-sm ${disabledClass}`}
              />
            </div>
            <button
              onClick={handleSubmitCommand}
              disabled={!selectedPlayerId || isSpectator}
              className={`btn-gothic self-end disabled:opacity-40 disabled:cursor-not-allowed ${disabledClass}`}
            >
              提交指令
            </button>
          </div>
        </section>
      )}

      {commands.length > 0 && (
        <section className="card-abyss border-gold-glow rounded-lg p-5">
          <h2 className="font-serif text-lg font-bold text-gold-400 mb-4">🎯 本回合指令队列</h2>
          <div className="flex flex-col gap-2">
            {sortedCommands.map((cmd, index) => {
              const info = COMMAND_TYPE_INFO[cmd.type]
              const isConflict = conflicts.has(cmd.id)
              return (
                <div
                  key={cmd.id}
                  className={`flex items-center gap-3 rounded-lg bg-abyss-600/30 px-4 py-3 border ${
                    isConflict ? 'border-blood-500/40' : 'border-gold-500/10'
                  }`}
                >
                  <span className="text-bone-500 text-xs tabular-nums min-w-[20px]">{index + 1}</span>
                  <span className="text-gold-400 font-serif font-bold text-sm min-w-[70px]">{cmd.playerName}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${info.color}20`,
                      color: info.color,
                      border: `1px solid ${info.color}40`,
                    }}
                  >
                    {info.label}
                  </span>
                  {isConflict && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-blood-900/40 text-blood-300 border border-blood-500/30">
                      <AlertTriangle size={12} />
                      冲突!
                    </span>
                  )}
                  <span className="text-gold-300 text-xs tabular-nums">AP:{cmd.cost}</span>
                  <span className="text-bone-400 text-xs flex-1 truncate">{cmd.description}</span>
                  <span className="text-bone-500 text-[10px] tabular-nums">优先级:{cmd.priority}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => reorderCommand(cmd.id, cmd.priority + 1000)}
                      disabled={isSpectator}
                      className={`btn-gothic px-1.5 py-1 text-xs ${disabledClass}`}
                      title="提升优先级"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => reorderCommand(cmd.id, cmd.priority - 1000)}
                      disabled={isSpectator}
                      className={`btn-gothic px-1.5 py-1 text-xs ${disabledClass}`}
                      title="降低优先级"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      onClick={() => removeCommand(cmd.id)}
                      disabled={isSpectator}
                      className={`btn-danger px-1.5 py-1 text-xs ${disabledClass}`}
                      title="删除指令"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="card-abyss border-gold-glow rounded-lg p-5">
        <h2 className="font-serif text-lg font-bold text-gold-400 mb-4">⚖️ 回合清算</h2>

        {currentPhase === 'action' && commands.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-bone-300 text-sm">已提交 {commands.length} 条指令，可以进行冲突检测预览。</p>
            {resolvedOrder.length > 0 && (
              <div className="rounded-lg bg-abyss-600/30 border border-gold-500/10 px-4 py-3">
                <p className="text-gold-500 text-xs font-serif mb-2">执行顺序预览：</p>
                {resolvedOrder.map((cmd, i) => {
                  const info = COMMAND_TYPE_INFO[cmd.type]
                  return (
                    <div key={cmd.id} className="flex items-center gap-2 text-xs py-1">
                      <span className="text-bone-500 tabular-nums">{i + 1}.</span>
                      <span className="text-gold-400 font-serif">{cmd.playerName}</span>
                      <span style={{ color: info.color }}>{info.label}</span>
                      <span className="text-bone-500 truncate">{cmd.description}</span>
                    </div>
                  )
                })}
              </div>
            )}
            <button onClick={executeSettlement} disabled={isSpectator} className={`btn-gothic self-end flex items-center gap-2 ${disabledClass}`}>
              <Play size={16} />
              执行清算
            </button>
          </div>
        )}

        {currentPhase === 'action' && commands.length === 0 && (
          <p className="text-bone-500 text-sm">尚无指令，请先提交行动指令。</p>
        )}

        {currentPhase === 'settlement' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle size={20} />
              <span className="font-serif font-bold">结算已完成</span>
            </div>
            <p className="text-bone-300 text-sm">本回合指令已全部执行完毕，可以结束回合。</p>
            <button onClick={completeTurn} disabled={isSpectator} className={`btn-gothic self-end ${disabledClass}`}>
              结束回合
            </button>
          </div>
        )}

        {currentPhase === 'complete' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gold-400">
              <CheckCircle size={20} />
              <span className="font-serif font-bold">回合已结束</span>
            </div>
            <button onClick={startNewTurn} disabled={isSpectator} className={`btn-gothic self-end ${disabledClass}`}>
              开始新回合
            </button>
          </div>
        )}

        {currentPhase === 'conflict' && (
          <div className="flex flex-col gap-3">
            <p className="text-bone-300 text-sm">冲突检测中，确认执行清算以处理冲突。</p>
            <button onClick={executeSettlement} disabled={isSpectator} className={`btn-gothic self-end flex items-center gap-2 ${disabledClass}`}>
              <Play size={16} />
              执行清算
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
