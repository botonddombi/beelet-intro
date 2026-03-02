export interface BeeState {
  x: number
  y: number
  heading: number
  speed: number
  angularVel: number
  targetSpeed: number
  size: number
}

export const SIM_CONFIG = {
  BEE_COUNT: 40,
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
} as const
