<script setup lang="ts">
const emit = defineEmits<{
  start: []
}>()

const bgParticles = Array.from({ length: 15 }, () => ({
  left: Math.random() * 100 + '%',
  top: Math.random() * 100 + '%',
  animationDelay: Math.random() * 5 + 's',
  animationDuration: 3 + Math.random() * 4 + 's',
  width: 2 + Math.random() * 4 + 'px',
  height: 2 + Math.random() * 4 + 'px',
}))
</script>

<template>
  <div class="menu-overlay">
    <div class="menu-content">
      <div class="title-container">
        <h1 class="game-title">
          <span class="title-zombie">僵尸</span>
          <span class="title-survival">生存</span>
          <span class="title-shoot">射击</span>
        </h1>
        <div class="title-sub">ZOMBIE SURVIVAL SHOOTER</div>
      </div>

      <div class="controls-panel">
        <div class="controls-title">操作说明</div>
        <div class="control-row">
          <div class="key-group">
            <span class="key">W</span>
            <span class="key">A</span>
            <span class="key">S</span>
            <span class="key">D</span>
          </div>
          <span class="control-desc">移动</span>
        </div>
        <div class="control-row">
          <div class="key-group">
            <span class="key">🖱 左键</span>
          </div>
          <span class="control-desc">射击</span>
        </div>
        <div class="control-row">
          <div class="key-group">
            <span class="key">🎯 瞄准头部</span>
          </div>
          <span class="control-desc">伤害 ×3</span>
        </div>
      </div>

      <button class="start-btn" @click="emit('start')">
        <span class="btn-text">开始生存</span>
        <span class="btn-glow"></span>
      </button>

      <div class="tips">
        消灭每波僵尸存活下来 · 存活越久分数越高
      </div>
    </div>

    <div class="bg-particles">
      <div v-for="(p, i) in bgParticles" :key="i" class="bg-particle"
        :style="p"
      />
    </div>
  </div>
</template>

<style scoped>
.menu-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, rgba(20, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 70%);
  z-index: 20;
}

.menu-content {
  text-align: center;
  z-index: 2;
  animation: menu-fade-in 0.8s ease-out;
}

@keyframes menu-fade-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title-container {
  margin-bottom: 40px;
}

.game-title {
  font-family: 'Impact', 'Arial Black', sans-serif;
  font-size: 72px;
  line-height: 1.1;
  margin: 0;
  letter-spacing: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-zombie {
  color: #39ff14;
  text-shadow: 0 0 20px rgba(57, 255, 20, 0.6), 0 0 40px rgba(57, 255, 20, 0.3), 0 4px 8px rgba(0, 0, 0, 0.8);
}

.title-survival {
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.8);
}

.title-shoot {
  color: #e94560;
  text-shadow: 0 0 20px rgba(233, 69, 96, 0.6), 0 0 40px rgba(233, 69, 96, 0.3), 0 4px 8px rgba(0, 0, 0, 0.8);
}

.title-sub {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #666;
  letter-spacing: 8px;
  margin-top: 8px;
  text-shadow: 0 0 10px rgba(100, 100, 100, 0.3);
  animation: subtitle-flicker 3s ease-in-out infinite;
}

@keyframes subtitle-flicker {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.controls-panel {
  background: rgba(20, 0, 0, 0.6);
  border: 1px solid rgba(139, 0, 0, 0.4);
  border-radius: 4px;
  padding: 20px 30px;
  margin: 0 auto 35px;
  max-width: 320px;
}

.controls-title {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #8b0000;
  letter-spacing: 3px;
  margin-bottom: 14px;
  text-transform: uppercase;
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
}

.key-group {
  display: flex;
  gap: 5px;
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
  padding: 0 8px;
  background: rgba(40, 40, 60, 0.8);
  border: 1px solid rgba(100, 100, 120, 0.5);
  border-radius: 3px;
  font-size: 12px;
  color: #ddd;
  font-family: 'Courier New', monospace;
}

.control-desc {
  color: #999;
  font-size: 13px;
}

.start-btn {
  position: relative;
  display: inline-block;
  padding: 16px 48px;
  background: linear-gradient(180deg, #a01020 0%, #6b0011 100%);
  border: 2px solid #8b0000;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
  margin-bottom: 20px;
}

.start-btn:hover {
  background: linear-gradient(180deg, #c01030 0%, #8b0022 100%);
  border-color: #cc0000;
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(200, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.5);
}

.start-btn:active {
  transform: translateY(1px);
}

.btn-text {
  font-family: 'Impact', 'Arial Black', sans-serif;
  font-size: 24px;
  color: #fff;
  letter-spacing: 4px;
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

.tips {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #555;
  letter-spacing: 1px;
}

.bg-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}

.bg-particle {
  position: absolute;
  background: rgba(139, 0, 0, 0.4);
  border-radius: 50%;
  animation: float-up linear infinite;
}

@keyframes float-up {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.2;
  }
  100% {
    transform: translateY(-100vh) scale(0.3);
    opacity: 0;
  }
}
</style>
