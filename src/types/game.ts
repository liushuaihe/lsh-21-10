export type Phase = 'action' | 'conflict' | 'settlement' | 'complete'

export type StatusEffectType = 'frozen' | 'burning' | 'paralyzed' | 'shielded' | 'invisible'

export type CommandType = 'move' | 'investigate' | 'poison' | 'useItem' | 'defend' | 'custom'

export type GameEventType = 'action' | 'poison' | 'status' | 'death' | 'system'

export interface StatusEffect {
  type: StatusEffectType
  remainingTurns: number
  source: string
}

export interface PoisonStack {
  poisonType: string
  doses: number
  injectedAt: number
  triggerTurn: number
  source: string
}

export interface Item {
  id: string
  name: string
  type: 'antidote' | 'weapon' | 'armor' | 'consumable' | 'quest'
  description: string
}

export interface Player {
  id: string
  name: string
  hp: number
  maxHp: number
  actionPoints: number
  maxActionPoints: number
  agility: number
  statusEffects: StatusEffect[]
  poisonStacks: PoisonStack[]
  inventory: Item[]
  position: string
  isAlive: boolean
}

export interface PoisonDefinition {
  id: string
  name: string
  damagePerDose: number
  triggerDelay: number
  isLethal: boolean
  antidote: string | null
  color: string
}

export interface ActionCommand {
  id: string
  playerId: string
  playerName: string
  type: CommandType
  cost: number
  target?: string
  targetName?: string
  params: Record<string, unknown>
  submittedAt: number
  priority: number
  description: string
}

export interface PoisonRecord {
  id: string
  attackerId: string
  attackerName: string
  targetId: string
  targetName: string
  poisonType: string
  doses: number
  injectedAt: number
  triggerTurn: number
  isSettled: boolean
}

export interface GameEvent {
  id: string
  turnNumber: number
  type: GameEventType
  description: string
  timestamp: number
}

export interface TurnSnapshot {
  turnNumber: number
  phase: Phase
  players: Player[]
  commands: ActionCommand[]
  poisonRecords: PoisonRecord[]
  eventLog: GameEvent[]
  timestamp: number
}

export const DEFAULT_POISON_DEFINITIONS: PoisonDefinition[] = [
  {
    id: 'arsenic',
    name: '砒霜',
    damagePerDose: 10,
    triggerDelay: 1,
    isLethal: false,
    antidote: 'arsenic_antidote',
    color: '#22c55e',
  },
  {
    id: 'cyanide',
    name: '氰化物',
    damagePerDose: 25,
    triggerDelay: 0,
    isLethal: true,
    antidote: 'cyanide_antidote',
    color: '#ef4444',
  },
  {
    id: 'slow_poison',
    name: '慢性毒药',
    damagePerDose: 5,
    triggerDelay: 2,
    isLethal: false,
    antidote: null,
    color: '#a855f7',
  },
  {
    id: 'mandala',
    name: '曼陀罗',
    damagePerDose: 15,
    triggerDelay: 1,
    isLethal: false,
    antidote: 'mandala_antidote',
    color: '#f59e0b',
  },
  {
    id: 'hemlock',
    name: '毒芹',
    damagePerDose: 20,
    triggerDelay: 1,
    isLethal: true,
    antidote: null,
    color: '#06b6d4',
  },
]

export const STATUS_EFFECT_INFO: Record<StatusEffectType, { label: string; color: string; icon: string }> = {
  frozen: { label: '冰冻', color: '#93c5fd', icon: '❄️' },
  burning: { label: '灼烧', color: '#f97316', icon: '🔥' },
  paralyzed: { label: '麻痹', color: '#a78bfa', icon: '⚡' },
  shielded: { label: '护盾', color: '#34d399', icon: '🛡️' },
  invisible: { label: '隐身', color: '#94a3b8', icon: '👁️' },
}

export const COMMAND_TYPE_INFO: Record<CommandType, { label: string; color: string }> = {
  move: { label: '移动', color: '#60a5fa' },
  investigate: { label: '调查', color: '#34d399' },
  poison: { label: '投毒', color: '#a855f7' },
  useItem: { label: '使用道具', color: '#f59e0b' },
  defend: { label: '防御', color: '#3b82f6' },
  custom: { label: '自定义', color: '#94a3b8' },
}
