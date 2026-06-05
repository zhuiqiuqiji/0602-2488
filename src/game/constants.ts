export const ARENA_WIDTH = 2400
export const ARENA_HEIGHT = 1800
export const WALL_THICKNESS = 20

export const PLAYER_SPEED = 220
export const PLAYER_RADIUS = 18
export const PLAYER_MAX_HP = 100
export const PLAYER_INVINCIBLE_TIME = 1.0
export const PLAYER_SHOOT_COOLDOWN = 0.15

export const BULLET_SPEED = 700
export const BULLET_DAMAGE = 25
export const BULLET_RADIUS = 3
export const HEADSHOT_MULTIPLIER = 3

export const ZOMBIE_NORMAL_SPEED = 75
export const ZOMBIE_NORMAL_HP = 50
export const ZOMBIE_NORMAL_RADIUS = 16
export const ZOMBIE_NORMAL_HEAD_RADIUS = 9
export const ZOMBIE_NORMAL_DAMAGE = 10

export const ZOMBIE_FAST_SPEED = 130
export const ZOMBIE_FAST_HP = 30
export const ZOMBIE_FAST_RADIUS = 13
export const ZOMBIE_FAST_HEAD_RADIUS = 7
export const ZOMBIE_FAST_DAMAGE = 8

export const ZOMBIE_TANK_SPEED = 45
export const ZOMBIE_TANK_HP = 130
export const ZOMBIE_TANK_RADIUS = 22
export const ZOMBIE_TANK_HEAD_RADIUS = 12
export const ZOMBIE_TANK_DAMAGE = 20

export const ZOMBIE_ATTACK_COOLDOWN = 0.8

export const WAVE_BREAK_TIME = 3.5
export const SPAWN_INTERVAL = 0.4

export const SCORE_NORMAL_KILL = 100
export const SCORE_HEADSHOT_KILL = 250
export const SCORE_WAVE_BONUS_MULTIPLIER = 500

export const CAMERA_LERP = 0.08
export const CAMERA_SHAKE_DECAY = 0.9

export const MAX_BLOOD_STAINS = 80
export const MAX_PARTICLES = 300
export const BULLET_TRAIL_LENGTH = 5

export const COLORS = {
  ground: '#0d0d1a',
  grid: '#141428',
  wall: '#2a1a3a',
  wallBorder: '#4a2a5a',
  player: '#e94560',
  playerOutline: '#ff6b8a',
  playerGun: '#cccccc',
  bullet: '#ffd700',
  bulletTrail: 'rgba(255, 150, 0, 0.4)',
  zombieNormalBody: '#3d6b4f',
  zombieNormalHead: '#4a8a5f',
  zombieFastBody: '#6b3d5e',
  zombieFastHead: '#8a4a70',
  zombieTankBody: '#3d3d55',
  zombieTankHead: '#555577',
  zombieHit: '#ffffff',
  blood: '#8b0000',
  bloodStain: 'rgba(60, 0, 0, 0.6)',
  muzzleFlash: '#ffff44',
  hpBar: '#e94560',
  hpBarBg: '#2a0a0a',
  hpBarBorder: '#8b0000',
  vignette: 'rgba(0, 0, 0, 0.7)',
  damageFlash: 'rgba(255, 0, 0, 0.3)',
  headshotText: '#ff2222',
  scoreText: '#39ff14',
  waveText: '#ffd700',
}
