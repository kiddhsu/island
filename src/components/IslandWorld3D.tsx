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
/** 同時展開的標籤數（含選中會強制展開） */
const MAX_EXPANDED_LABELS = 4
const FOCUS_FRAMES = 48

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
      <ThreeToneBox
        args={[0.22, 0.22, 0.22]}
        position={[0.26, 1.08, 0.1]}
        rotation={[0, Math.PI / 5, 0]}
        top={top}
        left={left}
        right={left}
      />
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
      <mesh position={[0, 1.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.05, 6]} />
        <ToneMat color={top} />
      </mesh>
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
  /* 低分段圓 ≈ 切角台地，避免 48 段完美圓盤 */
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[11, 8]} />
        <meshStandardMaterial color={tint} flatShading roughness={0.62} metalness={0.02} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[8.0, 8.4, 8]} />
        <meshBasicMaterial color="#f7f2ea" transparent opacity={0.16} />
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
      /* 左右自由 360°；上下只留輕微俯仰 */
      minPolarAngle={0.72}
      maxPolarAngle={1.28}
      minZoom={0.75}
      maxZoom={1.55}
      target={ISO_TARGET}
    />
  )
}

/** 點島時鏡頭輕推近該島；關閉選取則緩緩回中心（保留目前方位） */
function FocusCam({
  selectedId,
  controlsRef,
  focusGen,
}: {
  selectedId: string | null
  controlsRef: MutableRefObject<ControlsApi | null>
  focusGen: number
}) {
  const goalTarget = useMemo(() => new THREE.Vector3(...ISO_TARGET), [])
  const goalPos = useMemo(() => new THREE.Vector3(...ISO_POS), [])
  const framesLeft = useRef(0)

  useEffect(() => {
    const c = controlsRef.current
    if (!c) return
    const offset = new THREE.Vector3().subVectors(c.object.position, c.target)
    const dist = Math.max(10, offset.length())

    if (!selectedId) {
      goalTarget.set(...ISO_TARGET)
      goalPos.copy(goalTarget).add(offset.normalize().multiplyScalar(dist))
    } else {
      const island = ISLANDS.find((i) => i.id === selectedId)
      if (!island) return
      const [x, , z] = islandPosition(island)
      goalTarget.set(x * 0.52, 0.55, z * 0.52)
      goalPos.copy(goalTarget).add(offset.normalize().multiplyScalar(dist * 0.82))
    }
    framesLeft.current = FOCUS_FRAMES
  }, [selectedId, focusGen, controlsRef, goalTarget, goalPos])

  useFrame(() => {
    if (framesLeft.current <= 0) return
    const c = controlsRef.current
    if (!c) return
    framesLeft.current -= 1
    const t = 0.1
    c.target.lerp(goalTarget, t)
    c.object.position.lerp(goalPos, t)
    c.update()
  })

  return null
}

/** 把 3D 座標投影到 DOM；只展開近鏡頭／選中標籤，其餘縮成點 */
function LabelSync({
  labelRefs,
  selectedRef,
}: {
  labelRefs: RefObject<Record<string, HTMLButtonElement | null>>
  selectedRef: RefObject<string | null>
}) {
  const { camera, size } = useThree()
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const world = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const refs = labelRefs.current
    if (!refs) return
    const selectedId = selectedRef.current
    const ranked: { id: string; dist: number; el: HTMLButtonElement; sx: number; sy: number; z: number }[] =
      []

    for (const island of ISLANDS) {
      const el = refs[island.id]
      if (!el) continue
      const [x, y, z] = islandPosition(island)
      world.set(x, y + LABEL_Y, z)
      const dist = camera.position.distanceTo(world)
      tmp.copy(world).project(camera)
      const sx = (tmp.x * 0.5 + 0.5) * size.width
      const sy = (-tmp.y * 0.5 + 0.5) * size.height
      const onScreen =
        tmp.z > -1 &&
        tmp.z < 1 &&
        sx > -48 &&
        sy > -48 &&
        sx < size.width + 48 &&
        sy < size.height + 48

      el.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy}px)`
      if (!onScreen) {
        el.style.visibility = 'hidden'
        el.style.zIndex = '0'
        el.classList.add('is-dot')
        el.classList.remove('is-expanded')
        continue
      }
      ranked.push({ id: island.id, dist, el, sx, sy, z: tmp.z })
    }

    ranked.sort((a, b) => a.dist - b.dist)
    const expanded = new Set(
      ranked.slice(0, MAX_EXPANDED_LABELS).map((r) => r.id),
    )
    if (selectedId) expanded.add(selectedId)

    for (const row of ranked) {
      const open = expanded.has(row.id)
      row.el.style.visibility = 'visible'
      row.el.style.zIndex = String(
        (open ? 40 : 28) + Math.round((1 - row.z) * 12),
      )
      row.el.classList.toggle('is-dot', !open)
      row.el.classList.toggle('is-expanded', open)
      if (open) {
        row.el.style.transform = `translate(-50%, -100%) translate(${row.sx}px, ${row.sy}px)`
      } else {
        row.el.style.transform = `translate(-50%, -50%) translate(${row.sx}px, ${row.sy}px)`
      }
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
  const [focusGen, setFocusGen] = useState(0)
  const [time, setTime] = useState<TimeMode>(() => timeFromLocalClock())
  const controlsRef = useRef<ControlsApi | null>(null)
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const selectedRef = useRef<string | null>(null)
  selectedRef.current = selectedId
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
    setFocusGen((n) => n + 1)
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
        <FocusCam
          selectedId={selectedId}
          controlsRef={controlsRef}
          focusGen={focusGen}
        />
        <LabelSync labelRefs={labelRefs} selectedRef={selectedRef} />
      </Canvas>

      <div className="map-label-layer" aria-hidden={false}>
        {ISLANDS.map((island) => (
          <button
            key={island.id}
            type="button"
            className={`map-pill map-pill-float is-dot${selectedId === island.id ? ' is-on' : ''}`}
            ref={(el) => {
              labelRefs.current[island.id] = el
            }}
            style={{ visibility: 'hidden' }}
            aria-label={island.name}
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
          左右滑可繞島一圈・捏合縮放
          <br />
          點小島或前方標籤即可選擇
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
