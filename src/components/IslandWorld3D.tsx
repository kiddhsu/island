import { Canvas, useThree } from '@react-three/fiber'
import { Float, Html, Line, OrbitControls } from '@react-three/drei'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { ISLANDS, islandPosition, type IslandMeta } from '../data/islands'
import { playSfx } from '../lib/sfx'
import { ThreeToneMaterial } from './ThreeToneMaterial'
import * as THREE from 'three'

type TimeMode = 'dawn' | 'day' | 'dusk' | 'night'

const TIME_PRESETS: Record<
  TimeMode,
  { label: string; sun: [number, number, number]; amb: number; fog: string; bg: string }
> = {
  dawn: {
    label: '清晨',
    sun: [5, 6, 5],
    amb: 0.85,
    fog: '#f0d8d0',
    bg: '#e8cfc8',
  },
  day: {
    label: '白天',
    sun: [6, 8, 4],
    amb: 0.95,
    fog: '#d4dce8',
    bg: '#c5d2e4',
  },
  dusk: {
    label: '黃昏',
    sun: [-4, 5, 5],
    amb: 0.75,
    fog: '#e8c4b0',
    bg: '#d9a890',
  },
  night: {
    label: '夜晚',
    sun: [-2, 7, -3],
    amb: 0.55,
    fog: '#3a3558',
    bg: '#2a2648',
  },
}

const ISO_POS: [number, number, number] = [9.2, 9.2, 9.2]
const ISO_TARGET: [number, number, number] = [0, 0.4, 0]

const ISLAND_INDEX = Object.fromEntries(
  ISLANDS.map((island, i) => [island.id, String(i + 1).padStart(2, '0')]),
) as Record<string, string>

function ThemeDecor({
  id,
  top,
  left,
  right,
}: {
  id: IslandMeta['id']
  top: string
  left: string
  right: string
}) {
  if (id === 'zhuyin') {
    return (
      <mesh position={[0.28, 1.05, 0.12]} rotation={[0, 0.4, 0]}>
        <torusGeometry args={[0.16, 0.04, 4, 12]} />
        <ThreeToneMaterial top={top} left={left} right={right} />
      </mesh>
    )
  }
  if (id === 'chars') {
    return (
      <mesh position={[-0.22, 1.08, 0.1]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.26, 0.32, 0.08]} />
        <ThreeToneMaterial top={top} left={left} right={right} />
      </mesh>
    )
  }
  if (id === 'reading') {
    return (
      <mesh position={[0.26, 0.98, -0.08]} rotation={[0.15, 0.35, 0]}>
        <boxGeometry args={[0.34, 0.08, 0.26]} />
        <ThreeToneMaterial top={top} left={left} right={right} />
      </mesh>
    )
  }
  if (id === 'number') {
    return (
      <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.2, 0]} />
        <ThreeToneMaterial top={top} left={left} right={right} />
      </mesh>
    )
  }
  if (id === 'measure') {
    return (
      <mesh position={[0.18, 1.1, 0.12]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.42, 0.07, 0.07]} />
        <ThreeToneMaterial top={top} left={left} right={right} />
      </mesh>
    )
  }
  if (id === 'safety') {
    return (
      <mesh position={[0, 1.15, 0]}>
        <coneGeometry args={[0.14, 0.32, 4]} />
        <ThreeToneMaterial top={top} left={left} right={right} />
      </mesh>
    )
  }
  if (id === 'nature') {
    return (
      <>
        <mesh position={[-0.22, 1.05, 0.08]}>
          <coneGeometry args={[0.18, 0.4, 4]} />
          <ThreeToneMaterial top={top} left={left} right={right} />
        </mesh>
        <mesh position={[0.2, 0.98, -0.12]}>
          <coneGeometry args={[0.15, 0.34, 4]} />
          <ThreeToneMaterial top={top} left={left} right={right} />
        </mesh>
      </>
    )
  }
  if (id === 'health') {
    return (
      <mesh position={[0.12, 1.08, 0.08]}>
        <cylinderGeometry args={[0.1, 0.1, 0.32, 6]} />
        <ThreeToneMaterial top={top} left={left} right={right} />
      </mesh>
    )
  }
  if (id === 'selfcare') {
    return (
      <mesh position={[0, 1.05, 0.12]} rotation={[0, 0.25, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
        <ThreeToneMaterial top={top} left={left} right={right} />
      </mesh>
    )
  }
  return (
    <mesh position={[0.1, 1.12, 0]} rotation={[0, Math.PI / 5, 0]}>
      <boxGeometry args={[0.22, 0.22, 0.22]} />
      <ThreeToneMaterial top={top} left={left} right={right} />
    </mesh>
  )
}

function IslandMesh({
  island,
  indexLabel,
  stars,
  selected,
  onSelect,
}: {
  island: IslandMeta
  indexLabel: string
  stars: number
  selected: boolean
  onSelect: () => void
}) {
  const pos = useMemo(() => islandPosition(island), [island])
  const top = island.soft
  const left = island.accent
  const right = island.deep
  const stoneTop = '#e8dcc8'
  const stoneLeft = '#d4c4a8'
  const stoneRight = '#a89070'
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const body = (
      <group
        position={pos}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
      >
        <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.15, 6]} />
          <meshBasicMaterial color={left} transparent opacity={0.18} />
        </mesh>
        {/* 階台底座 */}
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.28, 1.7]} />
          <ThreeToneMaterial top={stoneTop} left={stoneLeft} right={stoneRight} />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[1.25, 0.36, 1.25]} />
          <ThreeToneMaterial top={top} left={left} right={right} />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow rotation={[0, Math.PI / 8, 0]}>
          <boxGeometry args={[0.78, 0.42, 0.78]} />
          <ThreeToneMaterial top={top} left={left} right={right} />
        </mesh>
        <ThemeDecor id={island.id} top={top} left={left} right={right} />
        {selected ? (
          <mesh position={[0, 1.55, 0]}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshBasicMaterial color="#f0d878" />
          </mesh>
        ) : null}
        <Html
          position={[0, 2.2, 0]}
          center
          sprite
          distanceFactor={12}
          zIndexRange={[8, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <button
            type="button"
            className={`map-pill ${selected ? 'is-on' : ''}`}
            style={{ pointerEvents: 'auto' }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
          >
            <span className="map-pill-num" style={{ color: island.accent }}>
              {indexLabel}
            </span>
            <span className="map-pill-body">
              <strong>{island.name}</strong>
              <small>
                {island.short} · {'★'.repeat(stars)}
                {'☆'.repeat(Math.max(0, 3 - stars))}
              </small>
            </span>
          </button>
        </Html>
      </group>
  )

  if (reduceMotion) return body

  return (
    <Float
      speed={0.55 + (island.angle % 40) / 80}
      rotationIntensity={0.04}
      floatIntensity={0.22}
    >
      {body}
    </Float>
  )
}

function ConnectionRings() {
  const points = useMemo(() => {
    const pts = ISLANDS.map((island) => {
      const [x, , z] = islandPosition(island)
      return [x, 0.08, z] as [number, number, number]
    })
    return [...pts, pts[0]!]
  }, [])

  return (
    <Line
      points={points}
      color="#ffffff"
      transparent
      opacity={0.22}
      lineWidth={1.5}
      dashed={false}
    />
  )
}

function SoftCloud({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.1, 0.28, 0.55]} />
        <meshBasicMaterial color="#f4eee6" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0.45, 0.05, 0]}>
        <boxGeometry args={[0.55, 0.22, 0.4]} />
        <meshBasicMaterial color="#f4eee6" transparent opacity={0.45} />
      </mesh>
    </group>
  )
}

function SeaDisk({ tint }: { tint: string }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[11, 48]} />
        <meshBasicMaterial color={tint} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[8.1, 8.35, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.14} />
      </mesh>
      {/* 中心碑石 */}
      <mesh position={[0, 0.35, 0]} castShadow rotation={[0, Math.PI / 5, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <ThreeToneMaterial top="#f0e4d4" left="#e07a5f" right="#6d3a32" />
      </mesh>
      <mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 5, 0]}>
        <boxGeometry args={[0.28, 0.35, 0.28]} />
        <ThreeToneMaterial top="#f7f2ea" left="#d9c8b0" right="#8a7060" />
      </mesh>
    </>
  )
}

function SceneLights({ time }: { time: TimeMode }) {
  const preset = TIME_PRESETS[time]
  return (
    <>
      <color attach="background" args={[preset.bg]} />
      <fog attach="fog" args={[preset.fog, 10, 22]} />
      <ambientLight intensity={preset.amb} />
      <directionalLight
        castShadow
        position={preset.sun}
        intensity={time === 'night' ? 0.45 : 0.85}
        shadow-mapSize={[1024, 1024]}
        color={time === 'dusk' ? '#ffc09a' : '#fff5e8'}
      />
      <hemisphereLight
        intensity={0.28}
        color={time === 'night' ? '#8a90c8' : '#f5e8dc'}
        groundColor="#5a6a7a"
      />
    </>
  )
}

type ControlsApi = {
  object: THREE.Object3D & { zoom?: number; updateProjectionMatrix?: () => void }
  target: THREE.Vector3
  update: () => void
}

function OrthoFit() {
  const { camera, size } = useThree()
  useLayoutEffect(() => {
    const cam = camera as THREE.OrthographicCamera
    if (!(cam instanceof THREE.OrthographicCamera)) return
    const aspect = size.width / Math.max(1, size.height)
    const frustum = 7.2
    cam.left = (-frustum * aspect) / 2
    cam.right = (frustum * aspect) / 2
    cam.top = frustum / 2
    cam.bottom = -frustum / 2
    cam.near = 0.1
    cam.far = 80
    cam.zoom = 1
    cam.position.set(...ISO_POS)
    cam.lookAt(...ISO_TARGET)
    cam.updateProjectionMatrix()
  }, [camera, size.width, size.height])
  return null
}

function CameraRig({
  controlsRef,
}: {
  controlsRef: MutableRefObject<ControlsApi | null>
}) {
  return (
    <OrbitControls
      ref={controlsRef as never}
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      minPolarAngle={0.85}
      maxPolarAngle={1.15}
      minAzimuthAngle={-0.55}
      maxAzimuthAngle={0.55}
      minZoom={0.75}
      maxZoom={1.55}
      target={ISO_TARGET}
    />
  )
}

function timeFromLocalClock(date = new Date()): TimeMode {
  const h = date.getHours()
  if (h >= 5 && h < 8) return 'dawn'
  if (h >= 8 && h < 17) return 'day'
  if (h >= 17 && h < 19) return 'dusk'
  return 'night'
}

export function IslandWorld3D({ starsMap }: { starsMap: Record<string, number> }) {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [time, setTime] = useState<TimeMode>(() => timeFromLocalClock())
  const controlsRef = useRef<ControlsApi | null>(null)
  const selected = ISLANDS.find((i) => i.id === selectedId) ?? null
  const preset = TIME_PRESETS[time]
  const seaTint =
    time === 'night'
      ? '#3a4570'
      : time === 'dusk'
        ? '#6a88a8'
        : time === 'dawn'
          ? '#8aacc8'
          : '#7a9bb8'

  useEffect(() => {
    const sync = () => setTime(timeFromLocalClock())
    sync()
    const timer = window.setInterval(sync, 60_000)
    const onVis = () => {
      if (document.visibilityState === 'visible') sync()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  function resetView() {
    playSfx('tap', 0.3)
    const c = controlsRef.current
    if (!c) return
    c.object.position.set(...ISO_POS)
    c.target.set(...ISO_TARGET)
    if (typeof c.object.zoom === 'number') {
      c.object.zoom = 1
      c.object.updateProjectionMatrix?.()
    }
    c.update()
  }

  return (
    <div className={`map-3d-wrap time-${time}`}>
      <Canvas
        orthographic
        shadows
        camera={{ position: ISO_POS, zoom: 1, near: 0.1, far: 80 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true }}
      >
        <OrthoFit />
        <SceneLights time={time} />
        <SeaDisk tint={seaTint} />
        <ConnectionRings />
        <SoftCloud position={[-5.5, 4.2, -3]} />
        <SoftCloud position={[4.2, 4.8, -4.5]} />
        <SoftCloud position={[6.5, 3.6, 1.5]} />
        {ISLANDS.map((island) => (
          <IslandMesh
            key={island.id}
            island={island}
            indexLabel={ISLAND_INDEX[island.id] ?? '00'}
            stars={starsMap[island.id] ?? 0}
            selected={selectedId === island.id}
            onSelect={() => {
              playSfx('tap', 0.35)
              setSelectedId(island.id)
            }}
          />
        ))}
        <CameraRig controlsRef={controlsRef} />
      </Canvas>

      <div className="map-float-tools" aria-label="地圖操作">
        <button type="button" className="map-tool" onClick={resetView}>
          全景
        </button>
      </div>

      <div className="map-brand-chip">
        <strong>ISLAND QUEST</strong>
        <span>一座島一種冒險・{preset.label}</span>
      </div>

      {!selected ? (
        <div className="map-hint">
          輕轉視角・捏合縮放
          <br />
          點小島或標籤即可選擇
        </div>
      ) : null}

      {selected ? (
        <aside className="map-detail">
          <div className="map-detail-top">
            <span className="map-pill-num" style={{ color: selected.accent }}>
              {ISLAND_INDEX[selected.id]}
            </span>
            <div className="map-detail-copy">
              <h2>{selected.name}</h2>
              <p>{selected.blurb}</p>
            </div>
            <button
              type="button"
              className="map-detail-close"
              aria-label="關閉"
              onClick={() => {
                playSfx('tap', 0.3)
                setSelectedId(null)
              }}
            >
              ×
            </button>
          </div>
          <p className="map-detail-meta">
            {selected.howToPlay}
            <br />★{starsMap[selected.id] ?? 0}/3
          </p>
          <button
            type="button"
            className="app-btn block"
            style={{ background: selected.accent }}
            onClick={() => {
              playSfx('enter', 0.45)
              navigate(`/island/${selected.id}`)
            }}
          >
            進入此島
          </button>
        </aside>
      ) : null}
    </div>
  )
}
