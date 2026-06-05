import type { Player, Zombie, ZombieType, Bullet, Particle, BloodStain, Camera, GameState, GameStats, WaveConfig, HeadshotPopup, WaveAnnouncement } from './types'
import {
  ARENA_WIDTH, ARENA_HEIGHT, WALL_THICKNESS,
  PLAYER_SPEED, PLAYER_RADIUS, PLAYER_MAX_HP, PLAYER_INVINCIBLE_TIME, PLAYER_SHOOT_COOLDOWN,
  BULLET_SPEED, BULLET_DAMAGE, BULLET_RADIUS, HEADSHOT_MULTIPLIER,
  ZOMBIE_NORMAL_SPEED, ZOMBIE_NORMAL_HP, ZOMBIE_NORMAL_RADIUS, ZOMBIE_NORMAL_HEAD_RADIUS, ZOMBIE_NORMAL_DAMAGE,
  ZOMBIE_FAST_SPEED, ZOMBIE_FAST_HP, ZOMBIE_FAST_RADIUS, ZOMBIE_FAST_HEAD_RADIUS, ZOMBIE_FAST_DAMAGE,
  ZOMBIE_TANK_SPEED, ZOMBIE_TANK_HP, ZOMBIE_TANK_RADIUS, ZOMBIE_TANK_HEAD_RADIUS, ZOMBIE_TANK_DAMAGE,
  ZOMBIE_ATTACK_COOLDOWN,
  WAVE_BREAK_TIME, SPAWN_INTERVAL,
  SCORE_NORMAL_KILL, SCORE_HEADSHOT_KILL, SCORE_WAVE_BONUS_MULTIPLIER,
  CAMERA_LERP, CAMERA_SHAKE_DECAY,
  MAX_BLOOD_STAINS, MAX_PARTICLES, BULLET_TRAIL_LENGTH,
} from './constants'
import { circleCircle, distance, angleBetween, clamp, lerp, randomRange, randomInt, pointInCircle } from './collision'

export class GameEngine {
  state: GameState = 'menu'
  player: Player
  zombies: Zombie[] = []
  bullets: Bullet[] = []
  particles: Particle[] = []
  bloodStains: BloodStain[] = []
  headshotPopups: HeadshotPopup[] = []
  waveAnnouncement: WaveAnnouncement | null = null
  camera: Camera = { x: 0, y: 0, shakeX: 0, shakeY: 0, shakeIntensity: 0 }
  stats: GameStats = { score: 0, wave: 0, kills: 0, headshots: 0, timeAlive: 0 }
  damageFlashTimer = 0

  waveConfig: WaveConfig | null = null
  zombiesSpawned = 0
  zombiesKilledThisWave = 0
  spawnTimer = 0
  waveBreakTimer = 0
  nextZombieId = 0

  keys = new Set<string>()
  mouseX = 0
  mouseY = 0
  mouseDown = false
  canvasWidth = 1280
  canvasHeight = 720

  constructor() {
    this.player = this.createPlayer()
  }

  createPlayer(): Player {
    return {
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
      angle: 0,
      hp: PLAYER_MAX_HP,
      maxHp: PLAYER_MAX_HP,
      speed: PLAYER_SPEED,
      radius: PLAYER_RADIUS,
      invincibleTimer: 0,
      shootCooldown: 0,
    }
  }

  startGame() {
    this.state = 'playing'
    this.player = this.createPlayer()
    this.zombies = []
    this.bullets = []
    this.particles = []
    this.bloodStains = []
    this.headshotPopups = []
    this.waveAnnouncement = null
    this.camera = { x: 0, y: 0, shakeX: 0, shakeY: 0, shakeIntensity: 0 }
    this.stats = { score: 0, wave: 0, kills: 0, headshots: 0, timeAlive: 0 }
    this.damageFlashTimer = 0
    this.nextZombieId = 0
    this.startWave(1)
  }

  startWave(wave: number) {
    this.stats.wave = wave
    this.zombiesSpawned = 0
    this.zombiesKilledThisWave = 0
    this.spawnTimer = 0

    const zombieCount = 5 + wave * 3
    const speedMul = 1 + (wave - 1) * 0.08
    const hpMul = 1 + (wave - 1) * 0.12

    let types: ZombieType[] = ['normal']
    if (wave >= 2) types.push('fast')
    if (wave >= 3) types.push('tank')

    this.waveConfig = { zombieCount, speedMultiplier: speedMul, hpMultiplier: hpMul, types }

    this.waveAnnouncement = {
      text: wave === 1 ? '第 1 波' : `第 ${wave} 波`,
      life: 2.0,
      maxLife: 2.0,
    }
  }

  getWaveProgress(): number {
    if (!this.waveConfig) return 0
    return this.zombiesKilledThisWave / this.waveConfig.zombieCount
  }

  getRemainingZombies(): number {
    if (!this.waveConfig) return 0
    return this.waveConfig.zombieCount - this.zombiesKilledThisWave
  }

  getMouseWorldX(): number {
    return this.mouseX + this.camera.x + this.camera.shakeX
  }

  getMouseWorldY(): number {
    return this.mouseY + this.camera.y + this.camera.shakeY
  }

  update(dt: number) {
    if (this.state === 'menu' || this.state === 'gameover') return

    this.stats.timeAlive += dt

    if (this.state === 'waveBreak') {
      this.waveBreakTimer -= dt
      if (this.waveBreakTimer <= 0) {
        this.state = 'playing'
        this.startWave(this.stats.wave + 1)
      }
      this.updateCamera(dt)
      this.updateParticles(dt)
      this.updateHeadshotPopups(dt)
      this.updateWaveAnnouncement(dt)
      return
    }

    this.updatePlayer(dt)
    this.updateZombies(dt)
    this.updateBullets(dt)
    this.spawnZombies(dt)
    this.checkCollisions()
    this.updateParticles(dt)
    this.updateBloodStains(dt)
    this.updateCamera(dt)
    this.updateHeadshotPopups(dt)
    this.updateWaveAnnouncement(dt)
    this.updateDamageFlash(dt)

    if (this.player.hp <= 0) {
      this.state = 'gameover'
    }

    if (this.waveConfig && this.zombiesKilledThisWave >= this.waveConfig.zombieCount && this.zombies.length === 0) {
      this.stats.score += this.stats.wave * SCORE_WAVE_BONUS_MULTIPLIER
      this.state = 'waveBreak'
      this.waveBreakTimer = WAVE_BREAK_TIME
      this.waveAnnouncement = {
        text: `第 ${this.stats.wave} 波完成！`,
        life: WAVE_BREAK_TIME,
        maxLife: WAVE_BREAK_TIME,
      }
    }
  }

  updatePlayer(dt: number) {
    let dx = 0
    let dy = 0
    if (this.keys.has('w') || this.keys.has('arrowup')) dy -= 1
    if (this.keys.has('s') || this.keys.has('arrowdown')) dy += 1
    if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= 1
    if (this.keys.has('d') || this.keys.has('arrowright')) dx += 1

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy)
      dx /= len
      dy /= len
      this.player.x += dx * this.player.speed * dt
      this.player.y += dy * this.player.speed * dt
    }

    this.player.x = clamp(this.player.x, WALL_THICKNESS + this.player.radius, ARENA_WIDTH - WALL_THICKNESS - this.player.radius)
    this.player.y = clamp(this.player.y, WALL_THICKNESS + this.player.radius, ARENA_HEIGHT - WALL_THICKNESS - this.player.radius)

    const worldMouseX = this.getMouseWorldX()
    const worldMouseY = this.getMouseWorldY()
    this.player.angle = angleBetween(this.player.x, this.player.y, worldMouseX, worldMouseY)

    if (this.player.invincibleTimer > 0) {
      this.player.invincibleTimer -= dt
    }
    if (this.player.shootCooldown > 0) {
      this.player.shootCooldown -= dt
    }

    if (this.mouseDown && this.player.shootCooldown <= 0) {
      this.shoot()
    }
  }

  shoot() {
    this.player.shootCooldown = PLAYER_SHOOT_COOLDOWN
    const angle = this.player.angle
    const gunLength = this.player.radius + 12
    const bx = this.player.x + Math.cos(angle) * gunLength
    const by = this.player.y + Math.sin(angle) * gunLength

    const spread = randomRange(-0.03, 0.03)
    const bulletAngle = angle + spread

    this.bullets.push({
      x: bx,
      y: by,
      vx: Math.cos(bulletAngle) * BULLET_SPEED,
      vy: Math.sin(bulletAngle) * BULLET_SPEED,
      damage: BULLET_DAMAGE,
      radius: BULLET_RADIUS,
      alive: true,
      trail: [],
    })

    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: bx,
        y: by,
        vx: Math.cos(angle + randomRange(-0.5, 0.5)) * randomRange(50, 150),
        vy: Math.sin(angle + randomRange(-0.5, 0.5)) * randomRange(50, 150),
        life: randomRange(0.05, 0.15),
        maxLife: 0.15,
        color: '#ffff44',
        size: randomRange(2, 4),
      })
    }
  }

  updateZombies(dt: number) {
    for (const z of this.zombies) {
      const angle = angleBetween(z.x, z.y, this.player.x, this.player.y)
      z.angle = angle

      z.x += Math.cos(angle) * z.speed * dt
      z.y += Math.sin(angle) * z.speed * dt

      z.x = clamp(z.x, WALL_THICKNESS + z.radius, ARENA_WIDTH - WALL_THICKNESS - z.radius)
      z.y = clamp(z.y, WALL_THICKNESS + z.radius, ARENA_HEIGHT - WALL_THICKNESS - z.radius)

      if (z.hitTimer > 0) {
        z.hitTimer -= dt
      }
      if (z.attackCooldown > 0) {
        z.attackCooldown -= dt
      }
    }

    for (let i = 0; i < this.zombies.length; i++) {
      for (let j = i + 1; j < this.zombies.length; j++) {
        const a = this.zombies[i]
        const b = this.zombies[j]
        const d = distance(a.x, a.y, b.x, b.y)
        const minDist = a.radius + b.radius
        if (d < minDist && d > 0.01) {
          const overlap = (minDist - d) / 2
          const nx = (b.x - a.x) / d
          const ny = (b.y - a.y) / d
          a.x -= nx * overlap
          a.y -= ny * overlap
          b.x += nx * overlap
          b.y += ny * overlap
        }
      }
    }
  }

  updateBullets(dt: number) {
    for (const b of this.bullets) {
      if (!b.alive) continue
      b.trail.push({ x: b.x, y: b.y })
      if (b.trail.length > BULLET_TRAIL_LENGTH) {
        b.trail.shift()
      }
      b.x += b.vx * dt
      b.y += b.vy * dt

      if (b.x < 0 || b.x > ARENA_WIDTH || b.y < 0 || b.y > ARENA_HEIGHT) {
        b.alive = false
      }
    }
    this.bullets = this.bullets.filter(b => b.alive)
  }

  spawnZombies(dt: number) {
    if (!this.waveConfig) return
    if (this.zombiesSpawned >= this.waveConfig.zombieCount) return

    this.spawnTimer -= dt
    if (this.spawnTimer > 0) return
    this.spawnTimer = SPAWN_INTERVAL

    const type = this.waveConfig.types[randomInt(0, this.waveConfig.types.length - 1)]
    const zombie = this.createZombie(type)
    this.zombies.push(zombie)
    this.zombiesSpawned++
  }

  createZombie(type: ZombieType): Zombie {
    const side = randomInt(0, 3)
    let x: number, y: number

    switch (side) {
      case 0:
        x = randomRange(WALL_THICKNESS + 30, ARENA_WIDTH - WALL_THICKNESS - 30)
        y = WALL_THICKNESS + 30
        break
      case 1:
        x = randomRange(WALL_THICKNESS + 30, ARENA_WIDTH - WALL_THICKNESS - 30)
        y = ARENA_HEIGHT - WALL_THICKNESS - 30
        break
      case 2:
        x = WALL_THICKNESS + 30
        y = randomRange(WALL_THICKNESS + 30, ARENA_HEIGHT - WALL_THICKNESS - 30)
        break
      default:
        x = ARENA_WIDTH - WALL_THICKNESS - 30
        y = randomRange(WALL_THICKNESS + 30, ARENA_HEIGHT - WALL_THICKNESS - 30)
        break
    }

    const cfg = this.waveConfig!
    let speed: number, hp: number, radius: number, headRadius: number, damage: number

    switch (type) {
      case 'fast':
        speed = ZOMBIE_FAST_SPEED
        hp = ZOMBIE_FAST_HP
        radius = ZOMBIE_FAST_RADIUS
        headRadius = ZOMBIE_FAST_HEAD_RADIUS
        damage = ZOMBIE_FAST_DAMAGE
        break
      case 'tank':
        speed = ZOMBIE_TANK_SPEED
        hp = ZOMBIE_TANK_HP
        radius = ZOMBIE_TANK_RADIUS
        headRadius = ZOMBIE_TANK_HEAD_RADIUS
        damage = ZOMBIE_TANK_DAMAGE
        break
      default:
        speed = ZOMBIE_NORMAL_SPEED
        hp = ZOMBIE_NORMAL_HP
        radius = ZOMBIE_NORMAL_RADIUS
        headRadius = ZOMBIE_NORMAL_HEAD_RADIUS
        damage = ZOMBIE_NORMAL_DAMAGE
        break
    }

    return {
      id: this.nextZombieId++,
      x,
      y,
      angle: 0,
      hp: Math.round(hp * cfg.hpMultiplier),
      maxHp: Math.round(hp * cfg.hpMultiplier),
      speed: speed * cfg.speedMultiplier,
      radius,
      headRadius,
      damage,
      type,
      hitTimer: 0,
      attackCooldown: 0,
    }
  }

  checkCollisions() {
    for (const bullet of this.bullets) {
      if (!bullet.alive) continue

      for (const zombie of this.zombies) {
        if (zombie.hp <= 0) continue

        const headX = zombie.x + Math.cos(zombie.angle) * (zombie.radius * 0.6)
        const headY = zombie.y + Math.sin(zombie.angle) * (zombie.radius * 0.6)

        let isHeadshot = false
        let hit = false

        if (pointInCircle(bullet.x, bullet.y, headX, headY, zombie.headRadius)) {
          isHeadshot = true
          hit = true
        } else if (circleCircle(bullet.x, bullet.y, bullet.radius, zombie.x, zombie.y, zombie.radius)) {
          hit = true
        }

        if (hit) {
          bullet.alive = false
          const damage = isHeadshot ? bullet.damage * HEADSHOT_MULTIPLIER : bullet.damage
          zombie.hp -= damage
          zombie.hitTimer = 0.1

          this.spawnBloodParticles(bullet.x, bullet.y, isHeadshot)

          if (isHeadshot) {
            this.headshotPopups.push({
              x: zombie.x,
              y: zombie.y - zombie.radius - 15,
              life: 0.8,
              maxLife: 0.8,
              text: 'HEADSHOT!',
            })
          }

          if (zombie.hp <= 0) {
            this.zombiesKilledThisWave++
            this.stats.kills++
            this.stats.score += isHeadshot ? SCORE_HEADSHOT_KILL : SCORE_NORMAL_KILL
            if (isHeadshot) this.stats.headshots++

            this.bloodStains.push({
              x: zombie.x,
              y: zombie.y,
              radius: randomRange(12, 25),
              opacity: 0.7,
            })
            if (this.bloodStains.length > MAX_BLOOD_STAINS) {
              this.bloodStains.shift()
            }

            this.spawnDeathParticles(zombie.x, zombie.y)
          }
          break
        }
      }
    }

    this.zombies = this.zombies.filter(z => z.hp > 0)

    for (const zombie of this.zombies) {
      if (zombie.attackCooldown > 0) continue
      if (circleCircle(this.player.x, this.player.y, this.player.radius, zombie.x, zombie.y, zombie.radius)) {
        if (this.player.invincibleTimer <= 0) {
          this.player.hp -= zombie.damage
          this.player.invincibleTimer = PLAYER_INVINCIBLE_TIME
          this.damageFlashTimer = 0.3
          this.camera.shakeIntensity = 8

          this.spawnBloodParticles(this.player.x, this.player.y, false, 8)
        }
        zombie.attackCooldown = ZOMBIE_ATTACK_COOLDOWN
      }
    }
  }

  spawnBloodParticles(x: number, y: number, isHeadshot: boolean, count: number = 12) {
    const num = isHeadshot ? count * 2 : count
    for (let i = 0; i < num; i++) {
      const angle = randomRange(0, Math.PI * 2)
      const speed = randomRange(50, isHeadshot ? 250 : 180)
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomRange(0.2, 0.5),
        maxLife: 0.5,
        color: isHeadshot ? `hsl(${randomRange(0, 10)}, 100%, ${randomRange(30, 60)}%)` : `hsl(${randomRange(0, 10)}, 80%, ${randomRange(20, 40)}%)`,
        size: randomRange(isHeadshot ? 3 : 2, isHeadshot ? 7 : 5),
      })
    }
    if (this.particles.length > MAX_PARTICLES) {
      this.particles.splice(0, this.particles.length - MAX_PARTICLES)
    }
  }

  spawnDeathParticles(x: number, y: number) {
    for (let i = 0; i < 20; i++) {
      const angle = randomRange(0, Math.PI * 2)
      const speed = randomRange(30, 120)
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomRange(0.3, 0.7),
        maxLife: 0.7,
        color: `hsl(${randomRange(0, 15)}, 90%, ${randomRange(15, 45)}%)`,
        size: randomRange(3, 6),
      })
    }
    if (this.particles.length > MAX_PARTICLES) {
      this.particles.splice(0, this.particles.length - MAX_PARTICLES)
    }
  }

  updateParticles(dt: number) {
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 0.96
      p.vy *= 0.96
      p.life -= dt
    }
    this.particles = this.particles.filter(p => p.life > 0)
  }

  updateBloodStains(dt: number) {
    for (const s of this.bloodStains) {
      if (s.opacity > 0.2) {
        s.opacity -= dt * 0.02
      }
    }
  }

  updateCamera(dt: number) {
    const targetX = this.player.x - this.canvasWidth / 2
    const targetY = this.player.y - this.canvasHeight / 2

    this.camera.x = lerp(this.camera.x, targetX, CAMERA_LERP)
    this.camera.y = lerp(this.camera.y, targetY, CAMERA_LERP)

    this.camera.x = clamp(this.camera.x, 0, Math.max(0, ARENA_WIDTH - this.canvasWidth))
    this.camera.y = clamp(this.camera.y, 0, Math.max(0, ARENA_HEIGHT - this.canvasHeight))

    if (this.camera.shakeIntensity > 0.1) {
      this.camera.shakeX = randomRange(-this.camera.shakeIntensity, this.camera.shakeIntensity)
      this.camera.shakeY = randomRange(-this.camera.shakeIntensity, this.camera.shakeIntensity)
      this.camera.shakeIntensity *= CAMERA_SHAKE_DECAY
    } else {
      this.camera.shakeX = 0
      this.camera.shakeY = 0
      this.camera.shakeIntensity = 0
    }
  }

  updateHeadshotPopups(dt: number) {
    for (const p of this.headshotPopups) {
      p.y -= 40 * dt
      p.life -= dt
    }
    this.headshotPopups = this.headshotPopups.filter(p => p.life > 0)
  }

  updateWaveAnnouncement(dt: number) {
    if (this.waveAnnouncement) {
      this.waveAnnouncement.life -= dt
      if (this.waveAnnouncement.life <= 0) {
        this.waveAnnouncement = null
      }
    }
  }

  updateDamageFlash(dt: number) {
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer -= dt
    }
  }

  setCanvasSize(width: number, height: number) {
    this.canvasWidth = width
    this.canvasHeight = height
  }
}
