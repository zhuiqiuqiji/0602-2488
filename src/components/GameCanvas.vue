<script setup lang="ts">
import { ref } from 'vue'
import { useGameEngine } from '@/composables/useGameEngine'
import GameHUD from './GameHUD.vue'
import MainMenu from './MainMenu.vue'
import GameOver from './GameOver.vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const {
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
} = useGameEngine(canvasRef)

function handleStart() {
  startGame()
}

function handleRestart() {
  startGame()
}
</script>

<template>
  <div class="game-container">
    <canvas ref="canvasRef" class="game-canvas" />

    <MainMenu
      v-if="gameState === 'menu'"
      @start="handleStart"
    />

    <GameHUD
      v-if="gameState === 'playing' || gameState === 'waveBreak'"
      :hp="playerHp"
      :max-hp="playerMaxHp"
      :wave="currentWave"
      :score="score"
      :kills="kills"
      :headshots="headshots"
      :wave-progress="waveProgress"
      :remaining-zombies="remainingZombies"
      :is-wave-break="isWaveBreak"
      :wave-break-timer="waveBreakTimer"
    />

    <GameOver
      v-if="gameState === 'gameover'"
      :score="score"
      :wave="currentWave"
      :kills="kills"
      :headshots="headshots"
      @restart="handleRestart"
    />
  </div>
</template>

<style scoped>
.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  cursor: crosshair;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
