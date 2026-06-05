import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { GameEngine } from '@/game/engine'
import { Renderer } from '@/game/renderer'

export function useGameEngine(canvasRef: Ref<HTMLCanvasElement | null>) {
  const engine = new GameEngine()
  let renderer: Renderer | null = null
  let animFrameId = 0
  let lastTime = 0

  const gameState = ref(engine.state)
  const playerHp = ref(engine.player.hp)
  const playerMaxHp = ref(engine.player.maxHp)
  const currentWave = ref(engine.stats.wave)
  const score = ref(engine.stats.score)
  const kills = ref(engine.stats.kills)
  const headshots = ref(engine.stats.headshots)
  const waveProgress = ref(0)
  const remainingZombies = ref(0)
  const isWaveBreak = ref(false)
  const waveBreakTimer = ref(0)

  function syncState() {
    gameState.value = engine.state
    playerHp.value = Math.max(0, engine.player.hp)
    playerMaxHp.value = engine.player.maxHp
    currentWave.value = engine.stats.wave
    score.value = engine.stats.score
    kills.value = engine.stats.kills
    headshots.value = engine.stats.headshots
    waveProgress.value = engine.getWaveProgress()
    remainingZombies.value = engine.getRemainingZombies()
    isWaveBreak.value = engine.state === 'waveBreak'
    waveBreakTimer.value = Math.ceil(engine.waveBreakTimer)
  }

  function gameLoop(timestamp: number) {
    if (lastTime === 0) lastTime = timestamp
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
    lastTime = timestamp

    engine.update(dt)
    syncState()

    if (renderer) {
      renderer.render(engine)
    }

    animFrameId = requestAnimationFrame(gameLoop)
  }

  function startGame() {
    engine.startGame()
    lastTime = 0
    syncState()
  }

  function handleKeyDown(e: KeyboardEvent) {
    engine.keys.add(e.key.toLowerCase())
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
      e.preventDefault()
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    engine.keys.delete(e.key.toLowerCase())
  }

  function handleMouseMove(e: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    engine.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width)
    engine.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height)
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      engine.mouseDown = true
    }
  }

  function handleMouseUp(e: MouseEvent) {
    if (e.button === 0) {
      engine.mouseDown = false
    }
  }

  function handleContextMenu(e: Event) {
    e.preventDefault()
  }

  function handleResize() {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    engine.setCanvasSize(canvas.width, canvas.height)
  }

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    renderer = new Renderer(ctx)

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    engine.setCanvasSize(canvas.width, canvas.height)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('contextmenu', handleContextMenu)

    animFrameId = requestAnimationFrame(gameLoop)
  })

  onUnmounted(() => {
    cancelAnimationFrame(animFrameId)
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('resize', handleResize)

    const canvas = canvasRef.value
    if (canvas) {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
    window.removeEventListener('mouseup', handleMouseUp)
  })

  return {
    engine,
    gameState,
    playerHp,
    playerMaxHp,
    currentWave,
    score,
    kills,
    headshots,
    waveProgress,
    remainingZombies,
    isWaveBreak,
    waveBreakTimer,
    startGame,
  }
}
