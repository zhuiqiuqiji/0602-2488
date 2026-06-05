export interface Player {
  x: number
  y: number
  angle: number
  hp: number
  maxHp: number
  speed: number
  radius: number
  invincibleTimer: number
  shootCooldown: number
}

export interface Zombie {
  id: number
  x: number
  y: number
  angle: number
  hp: number
  maxHp: number
  speed: number
  radius: number
  headRadius: number
  damage: number
  type: ZombieType
  hitTimer: number
  attackCooldown: number
}

export type ZombieType = 'normal' | 'fast' | 'tank'

export interface Bullet {
  x: number
  y: number
  vx: number
  vy: number
  damage: number
  radius: number
  alive: boolean
  trail: Array<{ x: number; y: number }>
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export interface BloodStain {
  x: number
  y: number
  radius: number
  opacity: number
}

export type GameState = 'menu' | 'playing' | 'waveBreak' | 'gameover'

export interface WaveConfig {
  zombieCount: number
  speedMultiplier: number
  hpMultiplier: number
  types: ZombieType[]
}

export interface GameStats {
  score: number
  wave: number
  kills: number
  headshots: number
  timeAlive: number
}

export interface Camera {
  x: number
  y: number
  shakeX: number
  shakeY: number
  shakeIntensity: number
}

export interface HeadshotPopup {
  x: number
  y: number
  life: number
  maxLife: number
  text: string
}

export interface WaveAnnouncement {
  text: string
  life: number
  maxLife: number
}
