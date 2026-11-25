import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Line, OrbitControls } from '@react-three/drei'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { ISLANDS, islandPosition, type IslandMeta } from '../data/islands'
import { playSfx } from '../lib/sfx'
import { ThreeToneBox } from './ThreeToneMaterial'
import * as THREE from 'three'

type TimeMode = 'dawn' | 'day' | 'dusk' | 'night'

const TIME_PRESETS: Record<
  TimeMode,
  { label: string; sun: [number, number, number]; amb: number; fog: string; bg: string }
> = {
  dawn: {
    label: '清晨',
    sun: [5, 6, 5],
    amb: 0.88,
    fog: '#f0d8d0',
    bg: '#e8cfc8',
  },
  day: {
    label: '白天',
    sun: [6, 8, 4],
    amb: 0.95,
    fog: '#d4dce8',
    bg: '#b8c9e0',
  },
  dusk: {
    label: '黃昏',
    sun: [-4, 5, 5],
    amb: 0.78,
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

/** 等軸測視角 */
const ISO_POS: [number, number, number] = [9.2, 9.2, 9.2]
const ISO_TARGET: [number, number, number] = [0, 0.4, 0]
const FRUSTUM = 8.4
const LABEL_Y = 1.95

const ISLAND_INDEX = Object.fromEntries(
  ISLANDS.map((island, i) => [island.id, String(i + 1).padStart(2, '0')]),
) as Record<string, string>

function ToneMat({ color }: { color: string }) {
  return (
    <meshStandardMaterial color={color} flatShading roughness={0.84} metalness={0.02} />
  )
}

function ThemeDecor({
  id,
  top,
  left,
}: {
  id: IslandMeta['id']
  top: string
  left: string
}) {
  if (id === 'zhuyin') {
    return (
      <mesh position={[0.28, 1.05, 0.12]} rotation={[0, 0.4, 0]}>
        <torusGeometry args={[0.16, 0.04, 4, 12]} />
        <ToneMat color={left} />
      </mesh>
    )
  }
  if (id === 'chars') {
    return (
      <ThreeToneBox
        args={[0.26, 0.32, 0.08]}
        position={[-0.22, 1.08, 0.1]}
        rotation={[0, 0.3, 0]}
        top={top}
        left={left}
        right={left}
      />
    )
  }
  if (id === 'reading') {
    return (
      <ThreeToneBox
        args={[0.34, 0.08, 0.26]}
        position={[0.26, 0.98, -0.08]}
        rotation={[0.15, 0.35, 0]}
        top={top}
        left={left}
        right={left}
      />
    )
  }
  if (id === 'number') {
    return (
      <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.2, 0]} />
        <ToneMat color={left} />
      </mesh>
    )
  }
  if (id === 'measure') {
    return (
      <ThreeToneBox
        args={[0.42, 0.07, 0.07]}
        position={[0.18, 1.1, 0.12]}
        rotation={[0, 0, 0.35]}
        top={top}
        left={left}
        right={left}
      />
    )
  }
  if (id === 'safety') {
    return (
      <mesh position={[0, 1.15, 0]}>
        <coneGeometry args={[0.14, 0.32, 4]} />
        <ToneMat color={left} />
      </mesh>
    )
  }
  if (id === 'nature') {
    return (
      <>
        <mesh position={[-0.22, 1.05, 0.08]}>
          <coneGeometry args={[0.18, 0.4, 4]} />
          <ToneMat color={left} />
        </mesh>
        <mesh position={[0.2, 0.98, -0.12]}>
          <coneGeometry args={[0.15, 0.34, 4]} />
          <ToneMat color={top} />
        </mesh>
      </>
    )
  }
  if (id === 'health') {
    return (
      <mesh position={[0.12, 1.08, 0.08]}>
        <cylinderGeometry args={[0.1, 0.1, 0.32, 6]} />
        <ToneMat color={left} />
      </mesh>
    )
  }
  if (id === 'selfcare') {
    return (
      <ThreeToneBox
        args={[0.3, 0.2, 0.2]}
        position={[0, 1.05, 0.12]}
        rotation={[0, 0.25, 0]}
        top={top}
        left={left}
        right={left}
      />
    )
  }
  return (
    <ThreeToneBox
      args={[0.22, 0.22, 0.22]}
      position={[0.1, 1.12, 0]}
      rotation={[0, Math.PI / 5, 0]}
      top={top}
      left={left}
      right={left}
    />
  )
}

function IslandMesh({
  island,
  selected,
  onSelect,
  reduceMotion,
}: {
  island: IslandMeta
  selected: boolean
  onSelect: () => void
  reduceMotion: boolean
}) {
  const pos = useMemo(() => islandPosition(island), [island])
  const top = island.soft
  const left = island.accent
  const right = island.deep
  const stoneTop = '#ebe3d6'
  const stoneLeft = '#d4c4a8'
  const stoneRight = '#a89070'

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
      <ThreeToneBox
        args={[1.7, 0.28, 1.7]}
        position={[0, 0.12, 0]}
        top={stoneTop}
        left={stoneLeft}
        right={stoneRight}
        receiveShadow
      />
      <ThreeToneBox
        args={[1.25, 0.36, 1.25]}
        position={[0, 0.42, 0]}
        top={top}
        left={left}
        right={right}
      />
      <ThreeToneBox
        args={[0.78, 0.42, 0.78]}
        position={[0, 0.78, 0]}
        rotation={[0, Math.PI / 8, 0]}
        top={top}
        left={left}
        right={right}
      />
      <ThreeToneBox
        args={[0.5, 0.18, 0.5]}
        position={[0, 1.05, 0]}
        rotation={[0, Math.PI / 10, 0]}
        top={top}
        left={left}
        right={right}
      />
      <ThemeDecor id={island.id} top={top} left={left} />
      {selected ? (
        <mesh position={[0, 1.55, 0]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshBasicMaterial color="#f0d878" />
        </mesh>
      ) : null}
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
        <meshStandardMaterial color={tint} flatShading roughness={0.55} metalness={0.02} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[8.1, 8.35, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.14} />
      </mesh>
      <ThreeToneBox
        args={[0.7, 0.7, 0.7]}
        position={[0, 0.35, 0]}
        rotation={[0, Math.PI / 5, 0]}
        top="#f0e4d4"
        left="#e07a5f"
        right="#6d3a32"
      />
      <ThreeToneBox
        args={[0.28, 0.35, 0.28]}
        position={[0, 0.85, 0]}
        rotation={[0, Math.PI / 5, 0]}
        top="#f7f2ea"
        left="#d9c8b0"
        right="#8a7060"
      />
    </>
  )
}

function SceneLights({ time }: { time: TimeMode }) {
  const preset = TIME_PRESETS[time]
  return (
    <>
      <color attach="background" args={[preset.bg]} />
      <fog attach="fog" args={[preset.fog, 12, 26]} />
      <ambientLight intensity={preset.amb} />
      <directionalLight
        castShadow
        position={preset.sun}
        intensity={time === 'night' ? 0.5 : 1.05}
        shadow-mapSize={[1024, 1024]}
        color={time === 'dusk' ? '#ffc09a' : '#fff5e8'}
      />
      <hemisphereLight
        intensity={0.3}
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
    cam.left = (-FRUSTUM * aspect) / 2
    cam.right = (FRUSTUM * aspect) / 2
    cam.top = FRUSTUM / 2
    cam.bottom = -FRUSTUM / 2
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
      minPolarAngle={0.9}
      maxPolarAngle={1.12}
      minAzimuthAngle={-0.45}
      maxAzimuthAngle={0.45}
      minZoom={0.8}
      maxZoom={1.45}
      target={ISO_TARGET}
    />
  )
}

/** 把 3D 座標投影到 DOM，直接改 style（避免每幀 setState） */
function LabelSync({
  labelRefs,
}: {
  labelRefs: RefObject<Record<string, HTMLButtonElement | null>>
}) {
  const { camera, size } = useThree()
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const refs = labelRefs.current
    if (!refs) return
    for (const island of ISLANDS) {
      const el = refs[island.id]
      if (!el) continue
      const [x, y, z] = islandPosition(island)
      tmp.set(x, y + LABEL_Y, z)
      tmp.project(camera)
      const sx = (tmp.x * 0.5 + 0.5) * size.width
      const sy = (-tmp.y * 0.5 + 0.5) * size.height
      const onScreen =
        tmp.z > -1 &&
        tmp.z < 1 &&
        sx > -40 &&
        sy > -40 &&
        sx < size.width + 40 &&
        sy < size.height + 40
      el.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy}px)`
      el.style.visibility = onScreen ? 'visible' : 'hidden'
      el.style.zIndex = onScreen ? String(30 + Math.round((1 - tmp.z) * 10)) : '0'
    }
  })

  return null
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
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const selected = ISLANDS.find((i) => i.id === selectedId) ?? null
  const preset = TIME_PRESETS[time]
  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const seaTint =
    time === 'night'
      ? '#3a4570'
      : time === 'dusk'
        ? '#6a88a8'
        : time === 'dawn'
          ? '#8aacc8'
          : '#6a92b8'

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

  function selectIsland(id: string) {
    playSfx('tap', 0.35)
    setSelectedId(id)
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
            selected={selectedId === island.id}
            reduceMotion={reduceMotion}
            onSelect={() => selectIsland(island.id)}
          />
        ))}
        <CameraRig controlsRef={controlsRef} />
        <LabelSync labelRefs={labelRefs} />
      </Canvas>

      <div className="map-label-layer" aria-hidden={false}>
        {ISLANDS.map((island) => (
          <button
            key={island.id}
            type="button"
            className={`map-pill map-pill-float${selectedId === island.id ? ' is-on' : ''}`}
            ref={(el) => {
              labelRefs.current[island.id] = el
            }}
            style={{ visibility: 'hidden' }}
            onClick={() => selectIsland(island.id)}
          >
            <span className="map-pill-num" style={{ color: island.accent }}>
              {ISLAND_INDEX[island.id]}
            </span>
            <span className="map-pill-body">
              <strong>{island.name}</strong>
              <small>
                {island.short} · {'★'.repeat(starsMap[island.id] ?? 0)}
                {'☆'.repeat(Math.max(0, 3 - (starsMap[island.id] ?? 0)))}
              </small>
            </span>
          </button>
        ))}
      </div>

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
