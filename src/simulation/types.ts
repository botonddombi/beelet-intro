export interface BeeState {
  x: number
  y: number
  heading: number
  speed: number
  angularVel: number
  targetSpeed: number
  size: number
  alive: boolean
  age: number
  lifeTime: number
}

export const SIM_CONFIG = {
  BEE_COUNT: 40,
  BEE_MAX: 60,
  BEE_SPAWN_INTERVAL: 0.4,
  BEE_LIFE_MIN: 8,
  BEE_LIFE_MAX: 25,
  BEE_FADE_DURATION: 1.0,
  SPEED_MIN: 30,
  SPEED_MAX: 90,
  ANGULAR_JITTER: 3.0,
  ANGULAR_DAMPING: 0.92,
  EDGE_ZONE: 100,
  EDGE_STEER_STRENGTH: 2.0,
  SPEED_EASE: 0.02,
  TARGET_SPEED_CHANGE_CHANCE: 0.005,
  SIZE_MIN: 16,
  SIZE_MAX: 48,

  HOVER_RADIUS: 150,
  HOVER_FORCE: 5.0,
  HOVER_SPEED_BOOST: 180,

  CLICK_SCATTER_RADIUS: 250,
  CLICK_SCATTER_FORCE: 8.0,
  CLICK_SCATTER_SPEED: 250,
  CLICK_SCATTER_DURATION: 0.6,

  CLICK_SWARM_FORCE: 3.0,
  CLICK_SWARM_SPEED: 120,
  CLICK_SWARM_DURATION: 2.0,
} as const

export interface InteractionState {
  mouseX: number
  mouseY: number
  isHovering: boolean
  clickX: number
  clickY: number
  clickTime: number
  phase: 'none' | 'scatter' | 'swarm'
}
