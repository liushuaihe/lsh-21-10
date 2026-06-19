import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { FlaskConical, Skull, Shield, Plus, Trash2 } from 'lucide-react'

export default function Poison() {
  const players = useGameStore((s) => s.players)
  const currentTurn = useGameStore((s) => s.currentTurn)
  const currentPhase = useGameStore((s) => s.currentPhase)
  const isSpectator = useGameStore((s) => s.isSpectator)
  const poisonRecords = useGameStore((s) => s.poisonRecords)
  const poisonDefinitions = useGameStore((s) => s.poisonDefinitions)
  const addPoisonRecord = useGameStore((s) => s.addPoisonRecord)
  const submitCommand = useGameStore((s) => s.submitCommand)
  const settlePoisons = useGameStore((s) => s.settlePoisons)

  const alivePlayers = players.filter((p) => p.isAlive)

  const disabledClass = isSpectator
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : ''

  const [attackerId, setAttackerId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [poisonType, setPoisonType] = useState(poisonDefinitions[0]?.id ?? '')
  const [doses, setDoses] = useState(1)
  const [message, setMessage] = useState('')

  const attacker = alivePlayers.find((p) => p.id === attackerId)
  const target = alivePlayers.find((p) => p.id === targetId)
  const selectedPoison = poisonDefinitions.find((d) => d.id === poisonType)

  const handlePoison = () => {
    if (currentPhase !== 'action') {
      setMessage('⚠️ 仅在行动阶段可投毒')
      return
    }
    if (!attacker || !target || !selectedPoison) {
      setMessage('⚠️ 请完整填写投毒信息')
      return
    }

    const triggerDelay = selectedPoison.triggerDelay

    addPoisonRecord({
      attackerId: attacker.id,
      attackerName: attacker.name,
      targetId: target.id,
      targetName: target.name,
      poisonType: selectedPoison.id,
      doses,
      injectedAt: currentTurn,
      triggerTurn: currentTurn + triggerDelay,
      isSettled: false,
    })

    submitCommand({
      playerId: attacker.id,
      playerName: attacker.name,
      type: 'poison',
      cost: 2,
      target: target.id,
      targetName: target.name,
      params: { poisonType: selectedPoison.id, doses },
      submittedAt: Date.now(),
      description: `${attacker.name}对${target.name}投毒[${selectedPoison.name}×${doses}]`,
    })

    setMessage(`✅ ${attacker.name} 对 ${target.name} 投毒 [${selectedPoison.name}×${doses}]`)
    setAttackerId('')
    setTargetId('')
    setPoisonType(poisonDefinitions[0]?.id ?? '')
    setDoses(1)
  }

  const unsettledRecords = poisonRecords.filter((r) => !r.isSettled)

  const getRecordStatus = (triggerTurn: number) => {
    if (triggerTurn > currentTurn) return '待发作'
    if (triggerTurn === currentTurn) return '即将发作'
    return '已过期未结算'
  }

  const getStatusStyle = (triggerTurn: number) => {
    if (triggerTurn > currentTurn) return 'text-emerald-400'
    if (triggerTurn === currentTurn) return 'text-amber-400'
    return 'text-blood-300'
  }

  const getPoisonDef = (id: string) => poisonDefinitions.find((d) => d.id === id)

  const chainsByTarget = new Map<string, typeof unsettledRecords>()
  for (const record of unsettledRecords) {
    const arr = chainsByTarget.get(record.targetName) ?? []
    arr.push(record)
    chainsByTarget.set(record.targetName, arr)
  }

  return (
    <div className="min-h-screen p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="font-serif text-4xl font-bold text-gold-400 text-glow-gold tracking-wider">
        ☠️ 投毒结算面板
      </h1>

      <section className="card-abyss rounded-xl p-5">
        <h2 className="font-serif text-xl text-gold-500 mb-4 flex items-center gap-2 border-b border-gold-500/10 pb-2">
          <FlaskConical className="w-5 h-5" />
          录入投毒指令
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-bone-400 text-xs mb-1 block">施毒者</label>
            <select
              value={attackerId}
              onChange={(e) => setAttackerId(e.target.value)}
              disabled={isSpectator}
              className={`input-gothic w-full rounded ${disabledClass}`}
            >
              <option value="">选择施毒者</option>
              {alivePlayers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-bone-400 text-xs mb-1 block">目标</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              disabled={isSpectator}
              className={`input-gothic w-full rounded ${disabledClass}`}
            >
              <option value="">选择目标</option>
              {alivePlayers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-bone-400 text-xs mb-1 block">毒药类型</label>
            <select
              value={poisonType}
              onChange={(e) => setPoisonType(e.target.value)}
              disabled={isSpectator}
              className={`input-gothic w-full rounded ${disabledClass}`}
            >
              {poisonDefinitions.map((def) => (
                <option key={def.id} value={def.id}>
                  {def.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-bone-400 text-xs mb-1 block">剂量 (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={doses}
              onChange={(e) => setDoses(Math.max(1, Math.min(10, Number(e.target.value))))}
              disabled={isSpectator}
              className={`input-gothic w-full rounded ${disabledClass}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePoison}
            disabled={isSpectator}
            className={`btn-gothic rounded flex items-center gap-2 ${disabledClass}`}
          >
            <Plus className="w-4 h-4" />
            投毒
          </button>

          {selectedPoison && (
            <div className="flex items-center gap-2 text-sm text-bone-400">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: selectedPoison.color }}
              />
              <span>{selectedPoison.name}</span>
              <span className="text-bone-500">|</span>
              <span>伤害/剂: {selectedPoison.damagePerDose}</span>
              <span className="text-bone-500">|</span>
              <span>发作延迟: {selectedPoison.triggerDelay === 0 ? '立即' : `${selectedPoison.triggerDelay}回合`}</span>
            </div>
          )}
        </div>

        {message && (
          <p
            className={`mt-3 text-sm font-medium ${
              message.startsWith('✅') ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {message}
          </p>
        )}
      </section>

      <section className="card-abyss rounded-xl p-5">
        <h2 className="font-serif text-xl text-gold-500 mb-4 flex items-center gap-2 border-b border-gold-500/10 pb-2">
          <Skull className="w-5 h-5" />
          当前生效的毒药
        </h2>

        {unsettledRecords.length === 0 ? (
          <p className="text-bone-500 text-sm">暂无生效的毒药</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-bone-400 text-xs border-b border-gold-500/10">
                  <th className="text-left py-2 px-3">施毒者</th>
                  <th className="text-left py-2 px-3">目标</th>
                  <th className="text-left py-2 px-3">毒药类型</th>
                  <th className="text-left py-2 px-3">剂量</th>
                  <th className="text-left py-2 px-3">注入回合</th>
                  <th className="text-left py-2 px-3">发作回合</th>
                  <th className="text-left py-2 px-3">状态</th>
                  <th className="text-left py-2 px-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {unsettledRecords.map((record) => {
                  const def = getPoisonDef(record.poisonType)
                  const status = getRecordStatus(record.triggerTurn)
                  return (
                    <tr
                      key={record.id}
                      className="border-b border-abyss-300/30 transition-colors hover:bg-abyss-300/20"
                      style={{ borderLeftColor: def?.color, borderLeftWidth: 3 }}
                    >
                      <td className="py-2 px-3 text-bone-200">{record.attackerName}</td>
                      <td className="py-2 px-3 text-bone-200">{record.targetName}</td>
                      <td className="py-2 px-3">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: def?.color ?? '#a855f7' }}
                          />
                          <span style={{ color: def?.color }}>{def?.name ?? record.poisonType}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3 text-bone-200">{record.doses}</td>
                      <td className="py-2 px-3 text-bone-400">第{record.injectedAt}回合</td>
                      <td className="py-2 px-3 text-bone-400">第{record.triggerTurn}回合</td>
                      <td className={`py-2 px-3 font-medium ${getStatusStyle(record.triggerTurn)}`}>
                        {status}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => settlePoisons(record.triggerTurn)}
                          disabled={isSpectator}
                          className={`text-xs px-2 py-1 border border-amber-500/30 text-amber-400 bg-abyss-500/50 hover:bg-abyss-400/50 rounded transition-colors ${disabledClass}`}
                        >
                          手动结算
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card-abyss rounded-xl p-5">
        <h2 className="font-serif text-xl text-gold-500 mb-4 flex items-center gap-2 border-b border-gold-500/10 pb-2">
          <FlaskConical className="w-5 h-5" />
          毒药图鉴
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {poisonDefinitions.map((def) => (
            <div
              key={def.id}
              className="rounded-lg bg-abyss-500/40 border p-4 space-y-2"
              style={{ borderColor: `${def.color}30` }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-serif font-bold text-base" style={{ color: def.color }}>
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: def.color }} />
                  {def.name}
                </span>
                {def.isLethal && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blood-900/40 text-blood-300 border border-blood-500/30 font-medium">
                    致命
                  </span>
                )}
              </div>
              <div className="text-xs space-y-1 text-bone-300">
                <p>伤害/剂: <span className="text-blood-200 font-medium">{def.damagePerDose}</span></p>
                <p>发作延迟: <span className="text-amber-300 font-medium">{def.triggerDelay === 0 ? '立即' : `${def.triggerDelay}回合后`}</span></p>
                <p>解药: <span className={def.antidote ? 'text-emerald-400' : 'text-bone-500'}>{def.antidote ? def.antidote.replace('_antidote', '') : '无解药'}</span></p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card-abyss rounded-xl p-5">
        <h2 className="font-serif text-xl text-gold-500 mb-4 flex items-center gap-2 border-b border-gold-500/10 pb-2">
          <Shield className="w-5 h-5" />
          投毒链路图
        </h2>

        {unsettledRecords.length === 0 ? (
          <p className="text-bone-500 text-sm">暂无投毒链路</p>
        ) : (
          <div className="space-y-4">
            {Array.from(chainsByTarget.entries()).map(([targetName, records]) => (
              <div key={targetName}>
                <h3 className="text-bone-300 text-sm font-medium mb-2">
                  🎯 目标: <span className="text-gold-400">{targetName}</span>
                </h3>
                <div className="ml-4 space-y-1">
                  {records.map((record) => {
                    const def = getPoisonDef(record.poisonType)
                    return (
                      <p key={record.id} className="text-sm font-mono">
                        <span className="text-mystic-50">{record.attackerName}</span>
                        <span className="text-bone-500 mx-2">➜</span>
                        <span className="text-gold-300">{targetName}</span>
                        <span
                          className="ml-2 px-1.5 py-0.5 rounded text-xs"
                          style={{
                            color: def?.color,
                            backgroundColor: `${def?.color}15`,
                            border: `1px solid ${def?.color}30`,
                          }}
                        >
                          {def?.name}×{record.doses}
                        </span>
                        <span className="ml-2 text-bone-500 text-xs">发作:第{record.triggerTurn}回合</span>
                      </p>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card-abyss rounded-xl p-5">
        <h2 className="font-serif text-xl text-gold-500 mb-4 flex items-center gap-2 border-b border-gold-500/10 pb-2">
          <Trash2 className="w-5 h-5" />
          快速结算
        </h2>

        {currentPhase === 'settlement' ? (
          <button
            onClick={() => settlePoisons(currentTurn)}
            disabled={isSpectator}
            className={`btn-danger rounded flex items-center gap-2 ${disabledClass}`}
          >
            <Skull className="w-4 h-4" />
            结算当前回合毒发
          </button>
        ) : (
          <p className="text-bone-500 text-sm">仅在结算阶段可执行快速结算（当前: {currentPhase}）</p>
        )}
      </section>
    </div>
  )
}
