import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { TurnSnapshot, Player } from '@/types/game'
import { Clock, Rewind, AlertTriangle, Eye, ChevronRight } from 'lucide-react'

export default function TimeMachine() {
  const snapshots = useGameStore((s) => s.snapshots)
  const currentTurn = useGameStore((s) => s.currentTurn)
  const currentPhase = useGameStore((s) => s.currentPhase)
  const isSpectator = useGameStore((s) => s.isSpectator)
  const players = useGameStore((s) => s.players)
  const poisonRecords = useGameStore((s) => s.poisonRecords)
  const rewindToTurn = useGameStore((s) => s.rewindToTurn)

  const [selectedTurn, setSelectedTurn] = useState<number | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showFullLog, setShowFullLog] = useState(false)
  const [rewindSuccess, setRewindSuccess] = useState(false)

  const selectedSnapshot: TurnSnapshot | undefined = snapshots.find(
    (s) => s.turnNumber === selectedTurn
  )

  const aliveCount = players.filter((p) => p.isAlive).length

  const disabledClass = isSpectator
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : ''

  function handleRewind() {
    if (selectedTurn === null) return
    rewindToTurn(selectedTurn)
    setShowConfirm(false)
    setSelectedTurn(null)
    setShowFullLog(false)
    setRewindSuccess(true)
    setTimeout(() => setRewindSuccess(false), 3000)
  }

  if (snapshots.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto mb-4 h-16 w-16 text-gold-500/30" />
          <p className="font-serif text-lg text-gold-400/60">
            尚无历史快照，完成第一个回合后将自动生成快照
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-gold-400 text-glow-gold tracking-wider">
        ⏪ 时光倒流控制台
      </h1>

      <div className="rounded-lg border border-blood-500/30 bg-blood-900/10 px-5 py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-blood-400" />
          <p className="text-sm text-blood-300">
            ⚠️ 警告：时光倒流将清除目标回合之后的所有历史数据，此操作不可逆！
          </p>
          <span className="ml-auto text-2xl leading-none">💀</span>
        </div>
      </div>

      <section className="card-abyss rounded-xl p-5">
        <h2 className="mb-4 font-serif text-lg text-gold-400 tracking-wider">
          历史快照时间线
        </h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-0 min-w-max">
            {snapshots.map((snap, idx) => {
              const isSelected = selectedTurn === snap.turnNumber
              const isCurrent = snap.turnNumber === currentTurn
              const playerCount = snap.players.filter((p: Player) => p.isAlive).length
              return (
                <div key={snap.turnNumber} className="flex items-center">
                  <div
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => {
                      setSelectedTurn(snap.turnNumber)
                      setShowFullLog(false)
                    }}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-gold-400 bg-abyss-700 shadow-[0_0_12px_rgba(201,168,76,0.5)]'
                          : isCurrent
                            ? 'border-gold-500 bg-abyss-800 animate-glow'
                            : 'border-gold-500/40 bg-abyss-700 group-hover:border-gold-400/60'
                      }`}
                    >
                      <span className="font-serif text-sm font-bold text-gold-300">
                        {snap.turnNumber}
                      </span>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs text-bone-400">{snap.phase}</p>
                      <p className="text-xs text-bone-500">{playerCount} 人存活</p>
                      <p className="text-xs text-bone-600 tabular-nums">
                        {new Date(snap.timestamp).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {idx < snapshots.length - 1 && (
                    <div className="mx-1 h-0.5 w-8 bg-gold-500/20" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {selectedSnapshot && (
        <section className="card-abyss rounded-xl p-5 animate-slide-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg text-gold-400 tracking-wider">
              快照详情 - 第{selectedSnapshot.turnNumber}回合
            </h2>
            <button
              onClick={() => setShowFullLog(!showFullLog)}
              className="btn-gothic flex items-center gap-1.5 text-xs"
            >
              <Eye className="h-3.5 w-3.5" />
              🔍 {showFullLog ? '收起完整数据' : '查看完整数据'}
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-abyss-600/30 px-3 py-2 border border-gold-500/10">
              <p className="text-xs text-bone-500">阶段</p>
              <p className="text-sm font-medium text-gold-300">{selectedSnapshot.phase}</p>
            </div>
            <div className="rounded-lg bg-abyss-600/30 px-3 py-2 border border-gold-500/10">
              <p className="text-xs text-bone-500">存活玩家</p>
              <p className="text-sm font-medium text-gold-300">
                {selectedSnapshot.players.filter((p: Player) => p.isAlive).length} / {selectedSnapshot.players.length}
              </p>
            </div>
            <div className="rounded-lg bg-abyss-600/30 px-3 py-2 border border-gold-500/10">
              <p className="text-xs text-bone-500">执行指令</p>
              <p className="text-sm font-medium text-gold-300">{selectedSnapshot.commands.length} 条</p>
            </div>
            <div className="rounded-lg bg-abyss-600/30 px-3 py-2 border border-gold-500/10">
              <p className="text-xs text-bone-500">毒药记录</p>
              <p className="text-sm font-medium text-gold-300">
                {selectedSnapshot.poisonRecords.length} 条
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 text-sm font-serif text-gold-500 tracking-wider">
              玩家状态
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {selectedSnapshot.players.map((p: Player) => (
                <div
                  key={p.id}
                  className={`rounded-lg bg-abyss-600/30 px-3 py-2 border ${
                    p.isAlive ? 'border-gold-500/10' : 'border-blood-500/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`font-serif text-xs font-bold ${
                        p.isAlive ? 'text-gold-400' : 'text-blood-300 line-through'
                      }`}
                    >
                      {p.name}
                    </span>
                    {!p.isAlive && <span className="text-xs">💀</span>}
                  </div>
                  <div className="flex gap-3 text-xs text-bone-400">
                    <span className="text-blood-300">HP {p.hp}</span>
                    <span className="text-gold-300">AP {p.actionPoints}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedSnapshot.commands.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-serif text-gold-500 tracking-wider">
                本回合指令
              </h3>
              <div className="space-y-1">
                {selectedSnapshot.commands.map((cmd) => (
                  <div
                    key={cmd.id}
                    className="flex items-center gap-2 rounded bg-abyss-600/20 px-3 py-1.5 text-xs text-bone-300"
                  >
                    <ChevronRight className="h-3 w-3 shrink-0 text-gold-500/50" />
                    <span className="text-gold-400">{cmd.playerName}</span>
                    <span className="text-bone-500">-</span>
                    <span>{cmd.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-2 flex items-center gap-3 text-xs text-bone-500">
            <span>事件数: {selectedSnapshot.eventLog.length}</span>
          </div>

          {showFullLog && (
            <div className="mt-3 rounded-lg border border-gold-500/10 bg-abyss-800/40 p-3 max-h-60 overflow-y-auto">
              <h3 className="mb-2 text-xs font-serif text-gold-500 tracking-wider">
                完整事件日志
              </h3>
              {selectedSnapshot.eventLog.map((evt) => (
                <div
                  key={evt.id}
                  className="border-b border-abyss-600/30 py-1.5 text-xs text-bone-300 last:border-0"
                >
                  <span className="mr-2 text-bone-600 tabular-nums">
                    [{new Date(evt.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                  </span>
                  {evt.description}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="card-abyss rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-gold-400 tracking-wider">回退控制</h2>
            <p className="mt-1 text-xs text-bone-500">
              {selectedTurn !== null
                ? `已选中第 ${selectedTurn} 回合`
                : '请先在时间线上选择一个快照'}
            </p>
          </div>
          <button
            disabled={selectedTurn === null || isSpectator}
            onClick={() => setShowConfirm(true)}
            className={`btn-danger flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed ${disabledClass}`}
          >
            <Rewind className="h-4 w-4" />
            ⏪ 回退至此回合
          </button>
        </div>
      </section>

      {rewindSuccess && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/10 px-5 py-3 text-sm text-emerald-400 animate-slide-in">
          ✅ 时光倒流成功！已回退至目标回合。
        </div>
      )}

      {showConfirm && selectedTurn !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="card-abyss border-gold-glow w-full max-w-md rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 font-serif text-lg text-blood-400 text-glow-blood">
              ⚠️ 确认回退
            </h3>
            <p className="mb-5 text-sm text-bone-300">
              确定要回退到第{selectedTurn}回合吗？第{selectedTurn + 1}到第{currentTurn}回合的所有数据将被永久清除。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-gothic text-sm"
              >
                取消
              </button>
              <button onClick={handleRewind} disabled={isSpectator} className={`btn-danger text-sm ${disabledClass}`}>
                确认回退
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="card-abyss rounded-xl p-5">
        <h2 className="mb-3 font-serif text-lg text-gold-400 tracking-wider">
          当前状态概览
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-abyss-600/30 px-3 py-2 border border-gold-500/10">
            <p className="text-xs text-bone-500">当前回合</p>
            <p className="text-lg font-serif font-bold text-gold-300 tabular-nums">{currentTurn}</p>
          </div>
          <div className="rounded-lg bg-abyss-600/30 px-3 py-2 border border-gold-500/10">
            <p className="text-xs text-bone-500">当前阶段</p>
            <p className="text-lg font-serif font-bold text-gold-300">{currentPhase}</p>
          </div>
          <div className="rounded-lg bg-abyss-600/30 px-3 py-2 border border-gold-500/10">
            <p className="text-xs text-bone-500">存活玩家</p>
            <p className="text-lg font-serif font-bold text-gold-300">
              {aliveCount}
            </p>
          </div>
          <div className="rounded-lg bg-abyss-600/30 px-3 py-2 border border-gold-500/10">
            <p className="text-xs text-bone-500">快照总数</p>
            <p className="text-lg font-serif font-bold text-gold-300 tabular-nums">
              {snapshots.length}
            </p>
          </div>
          <div className="col-span-2 rounded-lg bg-abyss-600/30 px-3 py-2 border border-gold-500/10 sm:col-span-4">
            <p className="text-xs text-bone-500">毒药记录总数</p>
            <p className="text-lg font-serif font-bold text-blood-300 tabular-nums">
              {poisonRecords.length}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
