import { SIM_CONFIG } from '../simulation/types'
import { useBeeSimulation } from '../simulation/useBeeSimulation'

export function BeeSwarm() {
  const { beesRef, elementsRef } = useBeeSimulation()

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.5 }}>
      {Array.from({ length: SIM_CONFIG.BEE_COUNT }, (_, i) => (
        <span
          key={i}
          ref={(el) => { elementsRef.current[i] = el }}
          className="absolute left-0 top-0"
          style={{
            fontSize: `${beesRef.current[i]?.size ?? 24}px`,
            willChange: 'transform',
          }}
        >
          🐝
        </span>
      ))}
    </div>
  )
}
