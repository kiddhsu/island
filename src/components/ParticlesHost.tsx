import { useCallback } from 'react'
import { Particles, ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Engine, ISourceOptions } from '@tsparticles/engine'

type Props = {
  options: ISourceOptions
}

export default function ParticlesHost({ options }: Props) {
  const init = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <ParticlesProvider init={init}>
      <Particles
        id={`island-fx-${Math.random().toString(36).slice(2, 9)}`}
        className="fx-particles"
        options={options}
      />
    </ParticlesProvider>
  )
}
