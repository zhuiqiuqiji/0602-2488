import type { GameEngine } from './engine'
import {
  ARENA_WIDTH, ARENA_HEIGHT, WALL_THICKNESS,
  PLAYER_SHOOT_COOLDOWN,
  COLORS,
} from './constants'

export class Renderer {
  ctx: CanvasRenderingContext2D
  offscreenCanvas: HTMLCanvasElement
  offscreenCtx: CanvasRenderingContext2D
  groundPattern: CanvasPattern | null = null

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    this.offscreenCanvas = document.createElement('canvas')
    this.offscreenCanvas.width = ARENA_WIDTH
    this.offscreenCanvas.height = ARENA_HEIGHT
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!
    this.createGroundPattern()
    this.renderGroundOnce()
  }

  createGroundPattern() {
    const tileSize = 64
    const tileCanvas = document.createElement('canvas')
    tileCanvas.width = tileSize
    tileCanvas.height = tileSize
    const tCtx = tileCanvas.getContext('2d')!

    tCtx.fillStyle = COLORS.ground
    tCtx.fillRect(0, 0, tileSize, tileSize)

    tCtx.strokeStyle = COLORS.grid
    tCtx.lineWidth = 0.5
    tCtx.strokeRect(0, 0, tileSize, tileSize)

    tCtx.fillStyle = 'rgba(255, 255, 255, 0.01)'
    for (let i = 0; i < 3; i++) {
      const rx = Math.random() * tileSize
      const ry = Math.random() * tileSize
      tCtx.fillRect(rx, ry, 1, 1)
    }

    this.groundPattern = this.offscreenCtx.createPattern(tileCanvas, 'repeat')
  }

  renderGroundOnce() {
    if (this.groundPattern) {
      this.offscreenCtx.fillStyle = this.groundPattern
    } else {
      this.offscreenCtx.fillStyle = COLORS.ground
    }
    this.offscreenCtx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
  }

  render(engine: GameEngine) {
    const { ctx } = this
    const w = engine.canvasWidth
    const h = engine.canvasHeight
    const camX = engine.camera.x + engine.camera.shakeX
    const camY = engine.camera.y + engine.camera.shakeY

    ctx.clearRect(0, 0, w, h)

    ctx.save()
    ctx.translate(-camX, -camY)

    this.drawGround(engine)
    this.drawBloodStains(engine)
    this.drawWalls(engine)
    this.drawZombies(engine)
    this.drawBullets(engine)
    this.drawPlayer(engine)
    this.drawParticles(engine)
    this.drawHeadshotPopups(engine)

    ctx.restore()

    this.drawWaveAnnouncement(engine)
    this.drawVignette(engine)
    this.drawDamageFlash(engine)
  }

  drawGround(_engine: GameEngine) {
    this.ctx.drawImage(this.offscreenCanvas, 0, 0)
  }

  drawBloodStains(engine: GameEngine) {
    const { ctx } = this
    for (const stain of engine.bloodStains) {
      ctx.beginPath()
      ctx.arc(stain.x, stain.y, stain.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(60, 0, 0, ${stain.opacity})`
      ctx.fill()
    }
  }

  drawWalls(engine: GameEngine) {
    const { ctx } = this

    ctx.fillStyle = COLORS.wall
    ctx.fillRect(0, 0, ARENA_WIDTH, WALL_THICKNESS)
    ctx.fillRect(0, ARENA_HEIGHT - WALL_THICKNESS, ARENA_WIDTH, WALL_THICKNESS)
    ctx.fillRect(0, 0, WALL_THICKNESS, ARENA_HEIGHT)
    ctx.fillRect(ARENA_WIDTH - WALL_THICKNESS, 0, WALL_THICKNESS, ARENA_HEIGHT)

    ctx.strokeStyle = COLORS.wallBorder
    ctx.lineWidth = 2
    ctx.strokeRect(WALL_THICKNESS, WALL_THICKNESS, ARENA_WIDTH - WALL_THICKNESS * 2, ARENA_HEIGHT - WALL_THICKNESS * 2)
  }

  drawPlayer(engine: GameEngine) {
    const { ctx } = this
    const p = engine.player

    if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5
    }

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fillStyle = COLORS.player
    ctx.fill()
    ctx.strokeStyle = COLORS.playerOutline
    ctx.lineWidth = 2
    ctx.stroke()

    const gunLen = p.radius + 14
    const gunWidth = 4
    const tipX = p.x + Math.cos(p.angle) * gunLen
    const tipY = p.y + Math.sin(p.angle) * gunLen

    ctx.beginPath()
    ctx.moveTo(p.x + Math.cos(p.angle) * p.radius * 0.5, p.y + Math.sin(p.angle) * p.radius * 0.5)
    ctx.lineTo(tipX, tipY)
    ctx.strokeStyle = COLORS.playerGun
    ctx.lineWidth = gunWidth
    ctx.lineCap = 'round'
    ctx.stroke()

    if (engine.player.shootCooldown > PLAYER_SHOOT_COOLDOWN * 0.5) {
      ctx.beginPath()
      ctx.arc(tipX, tipY, 6, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 100, ${(engine.player.shootCooldown / PLAYER_SHOOT_COOLDOWN) * 0.8})`
      ctx.fill()
    }

    ctx.globalAlpha = 1
  }

  drawZombies(engine: GameEngine) {
    const { ctx } = this

    for (const z of engine.zombies) {
      const bodyColor = z.hitTimer > 0 ? COLORS.zombieHit : this.getZombieBodyColor(z.type)
      const headColor = z.hitTimer > 0 ? COLORS.zombieHit : this.getZombieHeadColor(z.type)

      ctx.beginPath()
      ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2)
      ctx.fillStyle = bodyColor
      ctx.fill()
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      const headX = z.x + Math.cos(z.angle) * (z.radius * 0.6)
      const headY = z.y + Math.sin(z.angle) * (z.radius * 0.6)

      ctx.beginPath()
      ctx.arc(headX, headY, z.headRadius, 0, Math.PI * 2)
      ctx.fillStyle = headColor
      ctx.fill()
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.lineWidth = 1
      ctx.stroke()

      if (z.hp < z.maxHp) {
        const barWidth = z.radius * 2
        const barHeight = 3
        const barX = z.x - barWidth / 2
        const barY = z.y - z.radius - 8
        const hpRatio = z.hp / z.maxHp

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(barX, barY, barWidth, barHeight)

        ctx.fillStyle = hpRatio > 0.5 ? '#39ff14' : hpRatio > 0.25 ? '#ffaa00' : '#ff2222'
        ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight)
      }
    }
  }

  getZombieBodyColor(type: string): string {
    switch (type) {
      case 'fast': return COLORS.zombieFastBody
      case 'tank': return COLORS.zombieTankBody
      default: return COLORS.zombieNormalBody
    }
  }

  getZombieHeadColor(type: string): string {
    switch (type) {
      case 'fast': return COLORS.zombieFastHead
      case 'tank': return COLORS.zombieTankHead
      default: return COLORS.zombieNormalHead
    }
  }

  drawBullets(engine: GameEngine) {
    const { ctx } = this

    for (const b of engine.bullets) {
      if (b.trail.length > 1) {
        ctx.beginPath()
        ctx.moveTo(b.trail[0].x, b.trail[0].y)
        for (let i = 1; i < b.trail.length; i++) {
          ctx.lineTo(b.trail[i].x, b.trail[i].y)
        }
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = COLORS.bulletTrail
        ctx.lineWidth = 2
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
      ctx.fillStyle = COLORS.bullet
      ctx.fill()

      ctx.beginPath()
      ctx.arc(b.x, b.y, b.radius + 2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'
      ctx.fill()
    }
  }

  drawParticles(engine: GameEngine) {
    const { ctx } = this

    for (const p of engine.particles) {
      const alpha = p.life / p.maxLife
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.globalAlpha = alpha
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  drawHeadshotPopups(engine: GameEngine) {
    const { ctx } = this

    for (const popup of engine.headshotPopups) {
      const alpha = popup.life / popup.maxLife
      const scale = 1 + (1 - alpha) * 0.5

      ctx.save()
      ctx.translate(popup.x, popup.y)
      ctx.scale(scale, scale)
      ctx.globalAlpha = alpha

      ctx.font = 'bold 18px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillText(popup.text, 2, 2)

      ctx.fillStyle = COLORS.headshotText
      ctx.fillText(popup.text, 0, 0)

      ctx.restore()
    }
    ctx.globalAlpha = 1
  }

  drawWaveAnnouncement(engine: GameEngine) {
    if (!engine.waveAnnouncement) return

    const { ctx } = this
    const w = engine.canvasWidth
    const h = engine.canvasHeight
    const ann = engine.waveAnnouncement
    const alpha = ann.life / ann.maxLife
    const scale = 1 + Math.sin((1 - alpha) * Math.PI) * 0.3

    ctx.save()
    ctx.translate(w / 2, h / 2 - 50)
    ctx.scale(scale, scale)
    ctx.globalAlpha = Math.min(alpha * 2, 1)

    ctx.font = 'bold 48px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillText(ann.text, 3, 3)

    ctx.fillStyle = COLORS.waveText
    ctx.fillText(ann.text, 0, 0)

    ctx.restore()
    ctx.globalAlpha = 1
  }

  drawVignette(engine: GameEngine) {
    const { ctx } = this
    const w = engine.canvasWidth
    const h = engine.canvasHeight
    const cx = w / 2
    const cy = h / 2
    const radius = Math.max(w, h) * 0.7

    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(1, COLORS.vignette)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
  }

  drawDamageFlash(engine: GameEngine) {
    if (engine.damageFlashTimer <= 0) return

    const { ctx } = this
    const w = engine.canvasWidth
    const h = engine.canvasHeight
    const alpha = (engine.damageFlashTimer / 0.3) * 0.3

    ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`
    ctx.fillRect(0, 0, w, h)
  }
}
