<script setup lang="ts">
defineProps<{
  hp: number
  maxHp: number
  wave: number
  score: number
  kills: number
  headshots: number
  waveProgress: number
  remainingZombies: number
  isWaveBreak: boolean
  waveBreakTimer: number
}>()
</script>

<template>
  <div class="hud">
    <div class="hud-top-left">
      <div class="hp-container">
        <div class="hp-label">HP</div>
        <div class="hp-bar-bg">
          <div
            class="hp-bar-fill"
            :style="{ width: (hp / maxHp * 100) + '%' }"
            :class="{ 'hp-critical': hp / maxHp < 0.25 }"
          />
        </div>
        <div class="hp-text">{{ hp }} / {{ maxHp }}</div>
      </div>
    </div>

    <div class="hud-top-right">
      <div class="stat-item">
        <span class="stat-label">WAVE</span>
        <span class="stat-value wave-value">{{ wave }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">SCORE</span>
        <span class="stat-value score-value">{{ score.toLocaleString() }}</span>
      </div>
    </div>

    <div class="hud-bottom-left">
      <div class="kills-info">
        <span class="kill-count">☠ {{ kills }}</span>
        <span class="headshot-count" v-if="headshots > 0">🎯 {{ headshots }}</span>
      </div>
    </div>

    <div class="hud-bottom-right">
      <div class="wave-progress-container" v-if="!isWaveBreak">
        <div class="wave-progress-label">
          剩余: {{ remainingZombies }}
        </div>
        <div class="wave-progress-bar">
          <div
            class="wave-progress-fill"
            :style="{ width: (waveProgress * 100) + '%' }"
          />
        </div>
      </div>
    </div>

    <Transition name="wave-break">
      <div class="wave-break-overlay" v-if="isWaveBreak">
        <div class="wave-break-text">
          第 {{ wave + 1 }} 波即将来临...
        </div>
        <div class="wave-break-timer">{{ waveBreakTimer }}</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: 'Courier New', monospace;
  z-index: 10;
}

.hud-top-left {
  position: absolute;
  top: 20px;
  left: 20px;
}

.hp-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hp-label {
  color: #e94560;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
}

.hp-bar-bg {
  width: 200px;
  height: 16px;
  background: rgba(60, 0, 0, 0.8);
  border: 2px solid #8b0000;
  border-radius: 2px;
  overflow: hidden;
}

.hp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #e94560, #ff6b8a);
  transition: width 0.2s ease;
  box-shadow: 0 0 8px rgba(233, 69, 96, 0.6);
}

.hp-bar-fill.hp-critical {
  background: linear-gradient(90deg, #ff0000, #ff4444);
  animation: hp-pulse 0.5s ease-in-out infinite;
}

@keyframes hp-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.hp-text {
  color: #ff6b8a;
  font-size: 13px;
  text-shadow: 0 0 5px rgba(255, 107, 138, 0.5);
}

.hud-top-right {
  position: absolute;
  top: 20px;
  right: 20px;
  text-align: right;
}

.stat-item {
  margin-bottom: 6px;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #666;
  letter-spacing: 2px;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: bold;
  text-shadow: 0 0 10px currentColor;
}

.wave-value {
  color: #ffd700;
}

.score-value {
  color: #39ff14;
}

.hud-bottom-left {
  position: absolute;
  bottom: 20px;
  left: 20px;
}

.kills-info {
  display: flex;
  gap: 16px;
  font-size: 16px;
}

.kill-count {
  color: #aaa;
  text-shadow: 0 0 5px rgba(170, 170, 170, 0.3);
}

.headshot-count {
  color: #ff2222;
  text-shadow: 0 0 8px rgba(255, 34, 34, 0.5);
}

.hud-bottom-right {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.wave-progress-container {
  text-align: right;
}

.wave-progress-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.wave-progress-bar {
  width: 150px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.wave-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #39ff14, #00ff88);
  transition: width 0.3s ease;
  border-radius: 3px;
  box-shadow: 0 0 6px rgba(57, 255, 20, 0.4);
}

.wave-break-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.wave-break-text {
  font-size: 24px;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  margin-bottom: 10px;
}

.wave-break-timer {
  font-size: 64px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
  animation: timer-pulse 1s ease-in-out infinite;
}

@keyframes timer-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.wave-break-enter-active {
  transition: all 0.3s ease;
}
.wave-break-leave-active {
  transition: all 0.5s ease;
}
.wave-break-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5);
}
.wave-break-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.5);
}
</style>
