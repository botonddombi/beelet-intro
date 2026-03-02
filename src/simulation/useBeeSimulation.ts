import { useEffect, useRef } from 'react'
import type { BeeState } from './types'
import { SIM_CONFIG } from './types'
import { createBee, updateBee } from './wander'

function initBees(): BeeState[] {
  const w = window.innerWidth
  const h = window.innerHeight
  return Array.from({ length: SIM_CONFIG.BEE_COUNT }, () => createBee(w, h))
}

export function useBeeSimulation() {
  const beesRef = useRef<BeeState[]>(initBees())
  const elementsRef = useRef<(HTMLSpanElement | null)[]>([])
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    function tick(time: number) {
      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = time

      const w = window.innerWidth
      const h = window.innerHeight
      const bees = beesRef.current

      for (let i = 0; i < bees.length; i++) {
        updateBee(bees[i], dt, w, h)
        const el = elementsRef.current[i]
        if (el) {
          const deg = (bees[i].heading * 180) / Math.PI + 90
          el.style.transform = `translate(${bees[i].x}px, ${bees[i].y}px) rotate(${deg}deg)`
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { beesRef, elementsRef }
}
