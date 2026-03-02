import type { BeeState, InteractionState } from './types'
import { SIM_CONFIG } from './types'

const {
  SPEED_MIN, SPEED_MAX, ANGULAR_JITTER, ANGULAR_DAMPING, EDGE_ZONE, EDGE_STEER_STRENGTH, SPEED_EASE, TARGET_SPEED_CHANGE_CHANCE, SIZE_MIN, SIZE_MAX,
  HOVER_RADIUS, HOVER_FORCE, HOVER_SPEED_BOOST,
  CLICK_SCATTER_RADIUS, CLICK_SCATTER_FORCE, CLICK_SCATTER_SPEED,
  CLICK_SWARM_FORCE, CLICK_SWARM_SPEED,
  BEE_LIFE_MIN, BEE_LIFE_MAX,
} = SIM_CONFIG

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function createBee(w: number, h: number, alive = true): BeeState {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    heading: Math.random() * Math.PI * 2,
    speed: randomRange(SPEED_MIN, SPEED_MAX),
    angularVel: 0,
    targetSpeed: randomRange(SPEED_MIN, SPEED_MAX),
    size: randomRange(SIZE_MIN, SIZE_MAX),
    alive,
    age: 0,
    lifeTime: randomRange(BEE_LIFE_MIN, BEE_LIFE_MAX),
    glitch: true,
  }
}

export function respawnBee(bee: BeeState, w: number, h: number): void {
  const edge = Math.floor(Math.random() * 4)
  if (edge === 0) { bee.x = -20; bee.y = Math.random() * h }
  else if (edge === 1) { bee.x = w + 20; bee.y = Math.random() * h }
  else if (edge === 2) { bee.x = Math.random() * w; bee.y = -20 }
  else { bee.x = Math.random() * w; bee.y = h + 20 }
  bee.heading = Math.atan2(h / 2 - bee.y, w / 2 - bee.x) + (Math.random() - 0.5) * 1.0
  bee.speed = randomRange(SPEED_MIN, SPEED_MAX)
  bee.angularVel = 0
  bee.targetSpeed = randomRange(SPEED_MIN, SPEED_MAX)
  bee.size = randomRange(SIZE_MIN, SIZE_MAX)
  bee.alive = true
  bee.age = 0
  bee.lifeTime = randomRange(BEE_LIFE_MIN, BEE_LIFE_MAX)
  bee.glitch = Math.random() < 0.2
}

export function updateBee(bee: BeeState, dt: number, w: number, h: number, interaction?: InteractionState): void {
  // 1. Nudge angular velocity with random jitter
  bee.angularVel += (Math.random() - 0.5) * ANGULAR_JITTER * dt

  // 2. Damp angular velocity (frame-rate independent)
  bee.angularVel *= Math.pow(ANGULAR_DAMPING, dt * 60)

  // 3. Soft edge-avoidance steering
  let steerX = 0
  let steerY = 0

  if (bee.x < EDGE_ZONE) steerX += (EDGE_ZONE - bee.x) / EDGE_ZONE
  else if (bee.x > w - EDGE_ZONE) steerX -= (bee.x - (w - EDGE_ZONE)) / EDGE_ZONE

  if (bee.y < EDGE_ZONE) steerY += (EDGE_ZONE - bee.y) / EDGE_ZONE
  else if (bee.y > h - EDGE_ZONE) steerY -= (bee.y - (h - EDGE_ZONE)) / EDGE_ZONE

  if (steerX !== 0 || steerY !== 0) {
    const desiredHeading = Math.atan2(steerY, steerX)
    let diff = desiredHeading - bee.heading
    // Normalize to [-PI, PI]
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    bee.angularVel += diff * EDGE_STEER_STRENGTH * dt
  }

  // 3a. Hover repulsion
  if (interaction) {
    if (interaction.isHovering) {
      const dx = bee.x - interaction.mouseX
      const dy = bee.y - interaction.mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < HOVER_RADIUS && dist > 0) {
        const repelHeading = Math.atan2(dy, dx)
        let diff = repelHeading - bee.heading
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        const proximity = 1 - dist / HOVER_RADIUS
        bee.angularVel += diff * HOVER_FORCE * proximity * dt
        bee.targetSpeed = HOVER_SPEED_BOOST
      }
    }

    // 3b. Click scatter / swarm
    if (interaction.phase === 'scatter') {
      const dx = bee.x - interaction.clickX
      const dy = bee.y - interaction.clickY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < CLICK_SCATTER_RADIUS && dist > 0) {
        const repelHeading = Math.atan2(dy, dx)
        let diff = repelHeading - bee.heading
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        const proximity = 1 - dist / CLICK_SCATTER_RADIUS
        bee.angularVel += diff * CLICK_SCATTER_FORCE * proximity * dt
        bee.targetSpeed = CLICK_SCATTER_SPEED
      }
    } else if (interaction.phase === 'swarm') {
      const dx = interaction.clickX - bee.x
      const dy = interaction.clickY - bee.y
      const attractHeading = Math.atan2(dy, dx)
      let diff = attractHeading - bee.heading
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      bee.angularVel += diff * CLICK_SWARM_FORCE * dt
      bee.targetSpeed = CLICK_SWARM_SPEED
    }
  }

  // 4. Update heading from angular velocity
  bee.heading += bee.angularVel * dt

  // 5. Ease speed toward randomly changing target speed
  if (Math.random() < TARGET_SPEED_CHANGE_CHANCE) {
    bee.targetSpeed = randomRange(SPEED_MIN, SPEED_MAX)
  }
  bee.speed += (bee.targetSpeed - bee.speed) * SPEED_EASE

  // 6. Move along heading
  bee.x += Math.cos(bee.heading) * bee.speed * dt
  bee.y += Math.sin(bee.heading) * bee.speed * dt

  // 7. Wrap around screen edges as safety net
  if (bee.x < -50) bee.x = w + 50
  else if (bee.x > w + 50) bee.x = -50
  if (bee.y < -50) bee.y = h + 50
  else if (bee.y > h + 50) bee.y = -50
}
