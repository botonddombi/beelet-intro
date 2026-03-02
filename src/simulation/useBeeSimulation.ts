import { useEffect, useRef } from 'react'
import type { BeeState, InteractionState } from './types'
import { SIM_CONFIG } from './types'
import { createBee, respawnBee, updateBee } from './wander'

const { BEE_COUNT, BEE_MAX, BEE_SPAWN_INTERVAL, BEE_FADE_DURATION } = SIM_CONFIG

function initBees(): BeeState[] {
  const w = window.innerWidth
  const h = window.innerHeight
  const bees: BeeState[] = []
  for (let i = 0; i < BEE_MAX; i++) {
    bees.push(createBee(w, h, i < BEE_COUNT))
  }
  return bees
}

export function useBeeSimulation() {
  const beesRef = useRef<BeeState[]>(initBees())
  const elementsRef = useRef<(HTMLSpanElement | null)[]>([])
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const spawnTimerRef = useRef<number>(0)
  const interactionRef = useRef<InteractionState>({
    mouseX: 0,
    mouseY: 0,
    isHovering: false,
    clickX: 0,
    clickY: 0,
    clickTime: 0,
    phase: 'none',
  })

  useEffect(() => {
    const interaction = interactionRef.current

    const onMouseMove = (e: MouseEvent) => {
      interaction.mouseX = e.clientX
      interaction.mouseY = e.clientY
      interaction.isHovering = true
    }

    const onMouseLeave = () => {
      interaction.isHovering = false
    }

    const onClick = (e: MouseEvent) => {
      interaction.clickX = e.clientX
      interaction.clickY = e.clientY
      interaction.clickTime = performance.now()
      interaction.phase = 'scatter'
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        interaction.clickX = touch.clientX
        interaction.clickY = touch.clientY
        interaction.clickTime = performance.now()
        interaction.phase = 'scatter'
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('click', onClick)
    window.addEventListener('touchstart', onTouchStart, { passive: true })

    function tick(time: number) {
      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = time

      // Phase transitions
      if (interaction.clickTime > 0) {
        const elapsed = (performance.now() - interaction.clickTime) / 1000
        if (interaction.phase === 'scatter' && elapsed > SIM_CONFIG.CLICK_SCATTER_DURATION) {
          interaction.phase = 'swarm'
        }
        if (interaction.phase === 'swarm' && elapsed > SIM_CONFIG.CLICK_SCATTER_DURATION + SIM_CONFIG.CLICK_SWARM_DURATION) {
          interaction.phase = 'none'
          interaction.clickTime = 0
        }
      }

      const w = window.innerWidth
      const h = window.innerHeight
      const bees = beesRef.current

      // Spawn new bees over time
      spawnTimerRef.current += dt
      if (spawnTimerRef.current >= BEE_SPAWN_INTERVAL) {
        spawnTimerRef.current -= BEE_SPAWN_INTERVAL
        for (let i = 0; i < bees.length; i++) {
          if (!bees[i].alive) {
            respawnBee(bees[i], w, h)
            break
          }
        }
      }

      for (let i = 0; i < bees.length; i++) {
        const bee = bees[i]
        const el = elementsRef.current[i]

        if (!bee.alive) {
          if (el) el.style.opacity = '0'
          continue
        }

        bee.age += dt

        // Kill bee when lifetime exceeded and fade-out complete
        if (bee.age > bee.lifeTime + BEE_FADE_DURATION) {
          bee.alive = false
          if (el) el.style.opacity = '0'
          continue
        }

        updateBee(bee, dt, w, h, interaction)

        if (el) {
          const deg = (bee.heading * 180) / Math.PI + 90
          el.style.transform = `translate(${bee.x}px, ${bee.y}px) rotate(${deg}deg)`

          // Fade in / fade out
          let opacity = 1
          if (bee.age < BEE_FADE_DURATION) {
            opacity = bee.age / BEE_FADE_DURATION
          } else if (bee.age > bee.lifeTime) {
            opacity = 1 - (bee.age - bee.lifeTime) / BEE_FADE_DURATION
          }
          el.style.opacity = String(opacity)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('click', onClick)
      window.removeEventListener('touchstart', onTouchStart)
    }
  }, [])

  return { beesRef, elementsRef }
}
