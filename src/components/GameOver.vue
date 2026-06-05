<script setup lang="ts">
defineProps<{
  score: number
  wave: number
  kills: number
  headshots: number
}>()

const emit = defineEmits<{
  restart: []
}>()
</script>

<template>
  <div class="gameover-overlay">
    <div class="gameover-content">
      <div class="death-text">YOU DIED</div>

      <div class="stats-panel">
        <div class="stat-row">
          <span class="stat-label">最终分数</span>
          <span class="stat-val score-val">{{ score.toLocaleString() }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">存活波数</span>
          <span class="stat-val wave-val">{{ wave }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">击杀数</span>
          <span class="stat-val kill-val">{{ kills }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">爆头数</span>
          <span class="stat-val headshot-val">{{ headshots }}</span>
        </div>
      </div>

      <button class="restart-btn" @click="emit('restart')">
        <span class="btn-text">再来一次</span>
        <span class="btn-glow"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.gameover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, rgba(60, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.95) 70%);
  z-index: 20;
  animation: gameover-in 0.5s ease-out;
}

@keyframes gameover-in {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

.gameover-content {
  text-align: center;
  animation: content-rise 0.6s ease-out 0.2s both;
}

@keyframes content-rise {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.death-text {
  font-family: 'Impact', 'Arial Black', sans-serif;
  font-size: 80px;
  color: #8b0000;
  letter-spacing: 12px;
  text-shadow: 0 0 30px rgba(139, 0, 0, 0.8), 0 0 60px rgba(139, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.8);
  margin-bottom: 30px;
  animation: death-pulse 2s ease-in-out infinite;
}

@keyframes death-pulse {
  0%, 100% { text-shadow: 0 0 30px rgba(139, 0, 0, 0.8), 0 0 60px rgba(139, 0, 0, 0.4); }
  50% { text-shadow: 0 0 50px rgba(200, 0, 0, 1), 0 0 80px rgba(139, 0, 0, 0.6); }
}

.stats-panel {
  background: rgba(20, 0, 0, 0.7);
  border: 1px solid rgba(139, 0, 0, 0.5);
  border-radius: 4px;
  padding: 24px 40px;
  margin: 0 auto 30px;
  min-width: 280px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(139, 0, 0, 0.2);
  font-family: 'Courier New', monospace;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 14px;
  color: #888;
}

.stat-val {
  font-size: 22px;
  font-weight: bold;
}

.score-val {
  color: #39ff14;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
}

.wave-val {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.kill-val {
  color: #e94560;
  text-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
}

.headshot-val {
  color: #ff2222;
  text-shadow: 0 0 10px rgba(255, 34, 34, 0.5);
}

.restart-btn {
  position: relative;
  display: inline-block;
  padding: 14px 40px;
  background: linear-gradient(180deg, #a01020 0%, #6b0011 100%);
  border: 2px solid #8b0000;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.restart-btn:hover {
  background: linear-gradient(180deg, #c01030 0%, #8b0022 100%);
  border-color: #cc0000;
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(200, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.5);
}

.restart-btn:active {
  transform: translateY(1px);
}

.btn-text {
  font-family: 'Impact', 'Arial Black', sans-serif;
  font-size: 20px;
  color: #fff;
  letter-spacing: 3px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(255, 50, 50, 0.3), transparent 70%);
  animation: btn-glow-pulse 2s ease-in-out infinite;
}

@keyframes btn-glow-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}
</style>
