import type { BeeState } from './types'
import { SIM_CONFIG } from './types'

const { SPEED_MIN, SPEED_MAX, ANGULAR_JITTER, ANGULAR_DAMPING, EDGE_ZONE, EDGE_STEER_STRENGTH, SPEED_EASE, TARGET_SPEED_CHANGE_CHANCE, SIZE_MIN, SIZE_MAX } = SIM_CONFIG

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function createBee(w: number, h: number): BeeState {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    heading: Math.random() * Math.PI * 2,
    speed: randomRange(SPEED_MIN, SPEED_MAX),
    angularVel: 0,
    targetSpeed: randomRange(SPEED_MIN, SPEED_MAX),
    size: randomRange(SIZE_MIN, SIZE_MAX),
  }
}

export function updateBee(bee: BeeState, dt: number, w: number, h: number): void {
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
