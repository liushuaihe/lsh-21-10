import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  Player,
  ActionCommand,
  PoisonRecord,
  GameEvent,
  TurnSnapshot,
  PoisonDefinition,
  Phase,
  Item,
  StatusEffectType,
} from '@/types/game'
import { DEFAULT_POISON_DEFINITIONS } from '@/types/game'

let idCounter = 0
function genId(): string {
  idCounter += 1
  return `${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`
}

interface GameStore {
  players: Player[]
  currentTurn: number
  currentPhase: Phase
  commands: ActionCommand[]
  poisonRecords: PoisonRecord[]
  eventLog: GameEvent[]
  snapshots: TurnSnapshot[]
  poisonDefinitions: PoisonDefinition[]
  isSpectator: boolean

  addPlayer: (name: string, maxHp?: number, maxAp?: number, agility?: number) => void
  removePlayer: (id: string) => void
  updatePlayerAp: (id: string, delta: number) => void
  updatePlayerHp: (id: string, delta: number) => void
  addStatusEffect: (playerId: string, effect: { type: StatusEffectType; remainingTurns: number; source: string }) => void
  removeStatusEffect: (playerId: string, type: StatusEffectType) => void
  addItem: (playerId: string, item: Item) => void
  removeItem: (playerId: string, itemId: string) => void

  startNewTurn: () => void
  submitCommand: (cmd: Omit<ActionCommand, 'id' | 'priority'>) => void
  removeCommand: (cmdId: string) => void
  reorderCommand: (cmdId: string, newPriority: number) => void
  resolveConflicts: () => ActionCommand[]
  executeSettlement: () => void
  completeTurn: () => void

  addPoisonRecord: (record: Omit<PoisonRecord, 'id'>) => void
  settlePoisons: (turnNumber: number) => void

  rewindToTurn: (turnNumber: number) => void
  getSnapshot: (turnNumber: number) => TurnSnapshot | undefined

  resetGame: () => void
  toggleSpectator: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => ({
      players: [],
      currentTurn: 0,
      currentPhase: 'complete' as Phase,
      commands: [],
      poisonRecords: [],
      eventLog: [],
      snapshots: [],
      poisonDefinitions: DEFAULT_POISON_DEFINITIONS,
      isSpectator: false,

      addPlayer: (name, maxHp = 100, maxAp = 5, agility = 5) => {
        set((state) => {
          state.players.push({
            id: genId(),
            name,
            hp: maxHp,
            maxHp,
            actionPoints: maxAp,
            maxActionPoints: maxAp,
            agility,
            statusEffects: [],
            poisonStacks: [],
            inventory: [],
            position: '大厅',
            isAlive: true,
          })
        })
      },

      removePlayer: (id) => {
        set((state) => {
          state.players = state.players.filter((p) => p.id !== id)
          state.commands = state.commands.filter((c) => c.playerId !== id)
        })
      },

      updatePlayerAp: (id, delta) => {
        set((state) => {
          const player = state.players.find((p) => p.id === id)
          if (player) {
            player.actionPoints = Math.max(0, Math.min(player.maxActionPoints, player.actionPoints + delta))
          }
        })
      },

      updatePlayerHp: (id, delta) => {
        set((state) => {
          const player = state.players.find((p) => p.id === id)
          if (player) {
            player.hp = Math.max(0, Math.min(player.maxHp, player.hp + delta))
            if (player.hp <= 0) {
              player.isAlive = false
            }
          }
        })
      },

      addStatusEffect: (playerId, effect) => {
        set((state) => {
          const player = state.players.find((p) => p.id === playerId)
          if (player) {
            const existing = player.statusEffects.find((e) => e.type === effect.type)
            if (existing) {
              existing.remainingTurns = Math.max(existing.remainingTurns, effect.remainingTurns)
            } else {
              player.statusEffects.push(effect)
            }
          }
        })
      },

      removeStatusEffect: (playerId, type) => {
        set((state) => {
          const player = state.players.find((p) => p.id === playerId)
          if (player) {
            player.statusEffects = player.statusEffects.filter((e) => e.type !== type)
          }
        })
      },

      addItem: (playerId, item) => {
        set((state) => {
          const player = state.players.find((p) => p.id === playerId)
          if (player) {
            player.inventory.push(item)
          }
        })
      },

      removeItem: (playerId, itemId) => {
        set((state) => {
          const player = state.players.find((p) => p.id === playerId)
          if (player) {
            player.inventory = player.inventory.filter((i) => i.id !== itemId)
          }
        })
      },

      startNewTurn: () => {
        set((state) => {
          state.currentTurn += 1
          state.currentPhase = 'action'
          state.commands = []
          for (const player of state.players) {
            if (player.isAlive) {
              player.actionPoints = player.maxActionPoints
            }
          }
          state.eventLog.push({
            id: genId(),
            turnNumber: state.currentTurn,
            type: 'system',
            description: `=== 第 ${state.currentTurn} 回合开始 ===`,
            timestamp: Date.now(),
          })
        })
      },

      submitCommand: (cmd) => {
        set((state) => {
          if (state.currentPhase !== 'action' && state.currentPhase !== 'conflict') return
          const player = state.players.find((p) => p.id === cmd.playerId)
          if (!player || !player.isAlive) return
          if (player.actionPoints < cmd.cost) return

          player.actionPoints -= cmd.cost
          const priority = cmd.cost * 1000 + player.agility * 10 + state.commands.length
          state.commands.push({
            ...cmd,
            id: genId(),
            priority,
          })
          state.eventLog.push({
            id: genId(),
            turnNumber: state.currentTurn,
            type: 'action',
            description: `${cmd.playerName} 提交行动: ${cmd.description} (消耗${cmd.cost}AP)`,
            timestamp: Date.now(),
          })
        })
      },

      removeCommand: (cmdId) => {
        set((state) => {
          const cmd = state.commands.find((c) => c.id === cmdId)
          if (cmd) {
            const player = state.players.find((p) => p.id === cmd.playerId)
            if (player) {
              player.actionPoints = Math.min(player.maxActionPoints, player.actionPoints + cmd.cost)
            }
            state.commands = state.commands.filter((c) => c.id !== cmdId)
          }
        })
      },

      reorderCommand: (cmdId, newPriority) => {
        set((state) => {
          const cmd = state.commands.find((c) => c.id === cmdId)
          if (cmd) {
            cmd.priority = newPriority
          }
        })
      },

      resolveConflicts: () => {
        const state = get()
        const sorted = [...state.commands].sort((a, b) => b.priority - a.priority)
        return sorted
      },

      executeSettlement: () => {
        set((state) => {
          state.currentPhase = 'settlement'

          const sorted = [...state.commands].sort((a, b) => b.priority - a.priority)

          const conflicts: string[] = []
          const targetMap = new Map<string, ActionCommand[]>()
          for (const cmd of sorted) {
            if (cmd.target) {
              const arr = targetMap.get(cmd.target) || []
              arr.push(cmd)
              targetMap.set(cmd.target, arr)
            }
          }
          for (const [target, cmds] of targetMap) {
            if (cmds.length > 1) {
              conflicts.push(`目标 ${target} 有 ${cmds.length} 条指令冲突，按优先级排序执行`)
            }
          }

          for (const conflict of conflicts) {
            state.eventLog.push({
              id: genId(),
              turnNumber: state.currentTurn,
              type: 'system',
              description: `⚠️ 冲突检测: ${conflict}`,
              timestamp: Date.now(),
            })
          }

          for (const cmd of sorted) {
            state.eventLog.push({
              id: genId(),
              turnNumber: state.currentTurn,
              type: 'action',
              description: `▶ 执行: ${cmd.playerName} - ${cmd.description}`,
              timestamp: Date.now(),
            })

            if (cmd.type === 'poison' && cmd.target) {
              const params = cmd.params as { poisonType?: string; doses?: number }
              if (params.poisonType && params.doses) {
                const poisonDef = state.poisonDefinitions.find((d) => d.id === params.poisonType)
                const target = state.players.find((p) => p.id === cmd.target)
                if (target && poisonDef) {
                  target.poisonStacks.push({
                    poisonType: params.poisonType,
                    doses: params.doses,
                    injectedAt: state.currentTurn,
                    triggerTurn: state.currentTurn + poisonDef.triggerDelay,
                    source: cmd.playerName,
                  })
                  state.eventLog.push({
                    id: genId(),
                    turnNumber: state.currentTurn,
                    type: 'poison',
                    description: `☠️ ${cmd.playerName} 对 ${cmd.targetName} 投毒 [${poisonDef.name}×${params.doses}]，${poisonDef.triggerDelay === 0 ? '立即发作' : `${poisonDef.triggerDelay}回合后发作`}`,
                    timestamp: Date.now(),
                  })
                }
              }
            }
          }

          get().settlePoisons(state.currentTurn)

          for (const player of state.players) {
            if (!player.isAlive) continue
            const newEffects: typeof player.statusEffects = []
            for (const effect of player.statusEffects) {
              if (effect.remainingTurns > 1) {
                newEffects.push({ ...effect, remainingTurns: effect.remainingTurns - 1 })
              } else {
                state.eventLog.push({
                  id: genId(),
                  turnNumber: state.currentTurn,
                  type: 'status',
                  description: `${player.name} 的 [${effect.type}] 效果已消退`,
                  timestamp: Date.now(),
                })
              }
            }
            player.statusEffects = newEffects
          }

          for (const player of state.players) {
            if (player.hp <= 0 && player.isAlive) {
              player.isAlive = false
              state.eventLog.push({
                id: genId(),
                turnNumber: state.currentTurn,
                type: 'death',
                description: `💀 ${player.name} 已死亡！`,
                timestamp: Date.now(),
              })
            }
          }
        })
      },

      completeTurn: () => {
        set((state) => {
          state.currentPhase = 'complete'

          state.snapshots.push({
            turnNumber: state.currentTurn,
            phase: 'complete',
            players: JSON.parse(JSON.stringify(state.players)),
            commands: JSON.parse(JSON.stringify(state.commands)),
            poisonRecords: JSON.parse(JSON.stringify(state.poisonRecords)),
            eventLog: JSON.parse(JSON.stringify(state.eventLog)),
            timestamp: Date.now(),
          })

          state.eventLog.push({
            id: genId(),
            turnNumber: state.currentTurn,
            type: 'system',
            description: `=== 第 ${state.currentTurn} 回合结束 ===`,
            timestamp: Date.now(),
          })

          try {
            localStorage.setItem('game_snapshots', JSON.stringify(state.snapshots))
          } catch { /* storage write failed silently */ }
        })
      },

      addPoisonRecord: (record) => {
        set((state) => {
          state.poisonRecords.push({ ...record, id: genId() })
        })
      },

      settlePoisons: (turnNumber) => {
        set((state) => {
          for (const record of state.poisonRecords) {
            if (record.isSettled) continue
            if (record.triggerTurn > turnNumber) continue

            const target = state.players.find((p) => p.id === record.targetId)
            const poisonDef = state.poisonDefinitions.find((d) => d.id === record.poisonType)
            if (!target || !poisonDef) continue

            const hasAntidote = target.inventory.some((i) => i.id === poisonDef.antidote)
            if (hasAntidote && poisonDef.antidote) {
              const idx = target.inventory.findIndex((i) => i.id === poisonDef.antidote)
              if (idx !== -1) {
                target.inventory.splice(idx, 1)
                state.eventLog.push({
                  id: genId(),
                  turnNumber,
                  type: 'poison',
                  description: `🧪 ${target.name} 使用解药抵挡了 [${poisonDef.name}] 的毒发！`,
                  timestamp: Date.now(),
                })
              }
            } else {
              const totalDamage = poisonDef.damagePerDose * record.doses
              target.hp = Math.max(0, target.hp - totalDamage)
              state.eventLog.push({
                id: genId(),
                turnNumber,
                type: 'poison',
                description: `☠️ ${target.name} 毒发！[${poisonDef.name}] 造成 ${totalDamage} 伤害 (HP: ${target.hp}/${target.maxHp})`,
                timestamp: Date.now(),
              })

              if (target.hp <= 0) {
                target.isAlive = false
                state.eventLog.push({
                  id: genId(),
                  turnNumber,
                  type: 'death',
                  description: `💀 ${target.name} 因中毒死亡！`,
                  timestamp: Date.now(),
                })
              }
            }

            record.isSettled = true

            const stackIdx = target.poisonStacks.findIndex(
              (s) => s.poisonType === record.poisonType && s.source === record.attackerName && s.triggerTurn === record.triggerTurn
            )
            if (stackIdx !== -1) {
              target.poisonStacks.splice(stackIdx, 1)
            }
          }
        })
      },

      rewindToTurn: (turnNumber) => {
        set((state) => {
          const snapshot = state.snapshots.find((s) => s.turnNumber === turnNumber)
          if (!snapshot) return

          state.players = JSON.parse(JSON.stringify(snapshot.players))
          state.currentTurn = snapshot.turnNumber
          state.currentPhase = 'action'
          state.commands = []
          state.poisonRecords = JSON.parse(JSON.stringify(snapshot.poisonRecords)).map(
            (r: PoisonRecord) => ({ ...r, isSettled: false })
          )
          state.eventLog = JSON.parse(JSON.stringify(snapshot.eventLog))
          state.snapshots = state.snapshots.filter((s) => s.turnNumber < turnNumber)

          state.eventLog.push({
            id: genId(),
            turnNumber,
            type: 'system',
            description: `⏪ 时光倒流！回退至第 ${turnNumber} 回合，所有后续数据已清除`,
            timestamp: Date.now(),
          })

          try {
            localStorage.setItem('game_snapshots', JSON.stringify(state.snapshots))
          } catch { /* storage write failed silently */ }
        })
      },

      getSnapshot: (turnNumber) => {
        return get().snapshots.find((s) => s.turnNumber === turnNumber)
      },

      resetGame: () => {
        set((state) => {
          state.players = []
          state.currentTurn = 0
          state.currentPhase = 'complete'
          state.commands = []
          state.poisonRecords = []
          state.eventLog = []
          state.snapshots = []
          state.poisonDefinitions = DEFAULT_POISON_DEFINITIONS
        })
        try {
          localStorage.removeItem('game_snapshots')
        } catch { /* storage remove failed silently */ }
      },

      toggleSpectator: () => {
        set((state) => {
          state.isSpectator = !state.isSpectator
        })
      },
    })),
    {
      name: 'game_state',
      partialize: (state) => ({
        players: state.players,
        currentTurn: state.currentTurn,
        currentPhase: state.currentPhase,
        commands: state.commands,
        poisonRecords: state.poisonRecords,
        eventLog: state.eventLog,
        snapshots: state.snapshots,
        poisonDefinitions: state.poisonDefinitions,
        isSpectator: state.isSpectator,
      }),
    }
  )
)
