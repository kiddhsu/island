import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Html, Line, OrbitControls, Sky, Sparkles } from '@react-three/drei'
import {
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { ISLANDS, islandPosition, type IslandMeta } from '../data/islands'
import { playSfx } from '../lib/sfx'
import * as THREE from 'three'

type TimeMode = 'dawn' | 'day' | 'dusk' | 'night'

const TIME_PRESETS: Record<
  TimeMode,
  { label: string; sun: [number, number, number]; amb: number; fog: string; bg: string }
> = {
  dawn: {
    label: '清晨',
    sun: [4, 3, 6],
    amb: 0.7,
    fog: '#f7d6b8',
    bg: '#f3c9a5',
  },
  day: {
    label: '白天',
    sun: [6, 10, 4],
    amb: 0.95,
    fog: '#cfe8ff',
    bg: '#8ec8ff',
  },
  dusk: {
    label: '黃昏',
    sun: [-4, 2.5, 5],
    amb: 0.65,
    fog: '#ffb38a',
    bg: '#f08a5a',
  },
  night: {
    label: '夜晚',
    sun: [-2, 6, -4],
    amb: 0.35,
    fog: '#1a1c4b',
    bg: '#0d1230',
  },
}

const ISLAND_INDEX = Object.fromEntries(
  ISLANDS.map((island, i) => [island.id, String(i + 1).padStart(2, '0')]),
) as Record<string, string>

function ThemeDecor({ id }: { id: IslandMeta['id'] }) {
  if (id === 'zhuyin') {
    return (
      <mesh position={[0.35, 0.85, 0.2]}>
        <torusGeometry args={[0.18, 0.05, 8, 16]} />
        <meshStandardMaterial color="#ffe08a" flatShading />
      </mesh>
    )
  }
  if (id === 'chars') {
    return (
      <mesh position={[-0.25, 0.9, 0.15]}>
        <boxGeometry args={[0.28, 0.35, 0.08]} />
        <meshStandardMaterial color="#fff4df" flatShading />
      </mesh>
    )
  }
  if (id === 'reading') {
    return (
      <>
        <mesh position={[0.3, 0.75, -0.1]} rotation={[0.2, 0.4, 0]}>
          <boxGeometry args={[0.35, 0.08, 0.28]} />
          <meshStandardMaterial color="#7ad19a" flatShading />
        </mesh>
        <mesh position={[0.3, 0.86, -0.1]} rotation={[0.2, 0.4, 0]}>
          <boxGeometry args={[0.32, 0.06, 0.25]} />
          <meshStandardMaterial color="#fff" flatShading />
        </mesh>
      </>
    )
  }
  if (id === 'number') {
    return (
      <mesh position={[0, 1.05, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#ffe566" flatShading emissive="#c9a000" emissiveIntensity={0.25} />
      </mesh>
    )
  }
  if (id === 'measure') {
    return (
      <mesh position={[0.2, 0.95, 0.15]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.45, 0.08, 0.08]} />
        <meshStandardMaterial color="#dff" flatShading />
      </mesh>
    )
  }
  if (id === 'safety') {
    return (
      <mesh position={[0, 0.95, 0]}>
        <coneGeometry args={[0.16, 0.35, 4]} />
        <meshStandardMaterial color="#ff5a3c" flatShading />
      </mesh>
    )
  }
  if (id === 'nature') {
    return (
      <>
        <mesh position={[-0.25, 0.85, 0.1]}>
          <coneGeometry args={[0.22, 0.45, 5]} />
          <meshStandardMaterial color="#2f9e5b" flatShading />
        </mesh>
        <mesh position={[0.2, 0.8, -0.15]}>
          <coneGeometry args={[0.18, 0.38, 5]} />
          <meshStandardMaterial color="#4caf50" flatShading />
        </mesh>
      </>
    )
  }
  if (id === 'health') {
    return (
      <mesh position={[0.15, 0.9, 0.1]}>
        <cylinderGeometry args={[0.12, 0.12, 0.35, 8]} />
        <meshStandardMaterial color="#7ff0df" flatShading />
      </mesh>
    )
  }
  if (id === 'selfcare') {
    return (
      <mesh position={[0, 0.88, 0.15]}>
        <boxGeometry args={[0.32, 0.22, 0.22]} />
        <meshStandardMaterial color="#d9b896" flatShading />
      </mesh>
    )
  }
  return (
    <mesh position={[0.1, 0.95, 0]}>
      <sphereGeometry args={[0.16, 8, 8]} />
      <meshStandardMaterial color="#e7b6ff" flatShading emissive="#c77dff" emissiveIntensity={0.3} />
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
  const color = useMemo(() => new THREE.Color(island.accent), [island.accent])
  const soft = useMemo(() => new THREE.Color(island.soft), [island.soft])
  const sand = useMemo(() => new THREE.Color('#f0d7a8'), [])

  return (
    <Float speed={1.2 + (island.angle % 40) / 40} rotationIntensity={0.12} floatIntensity={0.55}>
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
        {/* 水下倒影底座 */}
        <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.25, 20]} />
          <meshStandardMaterial color={color} transparent opacity={0.22} />
        </mesh>
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.05, 1.35, 0.35, 7]} />
          <meshStandardMaterial color={sand} flatShading />
        </mesh>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.85, 1.05, 0.42, 6]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
        <mesh position={[0, 0.72, 0]} castShadow>
          <icosahedronGeometry args={[0.48, 0]} />
          <meshStandardMaterial color={soft} flatShading />
        </mesh>
        <ThemeDecor id={island.id} />
        {selected ? (
          <mesh position={[0, 1.45, 0]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial
              color="#f8d878"
              emissive="#f8d878"
              emissiveIntensity={1}
            />
          </mesh>
        ) : null}
        <Html
          position={[0, 1.75, 0]}
          center
          distanceFactor={9}
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
    </Float>
  )
}

function ConnectionRings() {
  const points = useMemo(() => {
    const pts = ISLANDS.map((island) => {
      const [x, , z] = islandPosition(island)
      return [x, 0.12, z] as [number, number, number]
    })
    return [...pts, pts[0]!]
  }, [])

  return (
    <Line
      points={points}
      color="#ffffff"
      transparent
      opacity={0.3}
      lineWidth={2}
      dashed={false}
    />
  )
}

function Cloud({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.position.x += dt * 0.15
    if (ref.current.position.x > 11) ref.current.position.x = -11
  })
  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.55, 8, 8]} />
        <meshStandardMaterial color="#fff" flatShading />
      </mesh>
      <mesh position={[0.45, 0.05, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#fff" flatShading />
      </mesh>
      <mesh position={[-0.4, 0, 0.1]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="#fff" flatShading />
      </mesh>
    </group>
  )
}

function SeaDisk({ tint }: { tint: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.2) * 0.02
  })
  return (
    <>
      <mesh
        ref={ref}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <circleGeometry args={[11, 64]} />
        <meshStandardMaterial color={tint} flatShading roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[8.2, 8.45, 64]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[1.7, 6]} />
        <meshStandardMaterial color="#f2d7a2" flatShading />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.55, 1.1, 0.55]} />
        <meshStandardMaterial color="#e52521" flatShading />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.18, 0.35, 0.18]} />
        <meshStandardMaterial color="#fff" flatShading />
      </mesh>
    </>
  )
}

function SceneLights({ time }: { time: TimeMode }) {
  const preset = TIME_PRESETS[time]
  return (
    <>
      <color attach="background" args={[preset.bg]} />
      <fog attach="fog" args={[preset.fog, 12, 28]} />
      <ambientLight intensity={preset.amb} />
      <directionalLight
        castShadow
        position={preset.sun}
        intensity={time === 'night' ? 0.55 : 1.35}
        shadow-mapSize={[1024, 1024]}
        color={time === 'dusk' ? '#ffb07a' : '#ffffff'}
      />
      <hemisphereLight
        intensity={0.35}
        color={time === 'night' ? '#6a7dff' : '#ffe9c8'}
        groundColor="#2a5a8a"
      />
      {time === 'night' ? null : (
        <Sky
          sunPosition={preset.sun}
          turbidity={time === 'dusk' ? 8 : 4}
          rayleigh={time === 'dawn' ? 3 : 1.2}
        />
      )}
    </>
  )
}

type ControlsApi = {
  object: THREE.Object3D & { position: THREE.Vector3 }
  target: THREE.Vector3
  update: () => void
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
      minDistance={6.5}
      maxDistance={16}
      maxPolarAngle={Math.PI / 2.2}
      target={[0, 0.5, 0]}
      enableDamping
      dampingFactor={0.06}
    />
  )
}

export function IslandWorld3D({
  starsMap,
  listOpen,
  onToggleList,
}: {
  starsMap: Record<string, number>
  listOpen: boolean
  onToggleList: () => void
}) {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [time, setTime] = useState<TimeMode>('day')
  const controlsRef = useRef<ControlsApi | null>(null)
  const selected = ISLANDS.find((i) => i.id === selectedId) ?? null
  const preset = TIME_PRESETS[time]
  const seaTint =
    time === 'night' ? '#243a7a' : time === 'dusk' ? '#4f7db8' : time === 'dawn' ? '#6ea7d8' : '#3f8fe0'

  function resetView() {
    playSfx('tap', 0.3)
    const c = controlsRef.current
    if (!c) return
    c.object.position.set(0, 7.8, 10.2)
    c.target.set(0, 0.5, 0)
    c.update()
  }

  function cycleTime() {
    playSfx('tap', 0.3)
    const order: TimeMode[] = ['dawn', 'day', 'dusk', 'night']
    const i = order.indexOf(time)
    setTime(order[(i + 1) % order.length]!)
  }

  return (
    <div className={`map-3d-wrap time-${time}`}>
      <Canvas
        shadows
        camera={{ position: [0, 7.8, 10.2], fov: 40 }}
        dpr={[1, 1.75]}
      >
        <SceneLights time={time} />
        <SeaDisk tint={seaTint} />
        <ConnectionRings />
        <Cloud position={[-6, 4.2, -3]} />
        <Cloud position={[3, 5.1, -5]} />
        <Cloud position={[7, 3.8, 2]} />
        <Sparkles
          count={time === 'night' ? 60 : 28}
          scale={[16, 6, 16]}
          size={time === 'night' ? 3 : 2}
          speed={0.35}
          opacity={0.45}
          color={time === 'night' ? '#fff7b0' : '#ffffff'}
        />
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
        <button type="button" className="map-tool" onClick={onToggleList}>
          {listOpen ? '收合' : '清單'}
        </button>
        <button type="button" className="map-tool" onClick={cycleTime}>
          {preset.label}
        </button>
      </div>

      <div className="map-brand-chip">
        <strong>ISLAND QUEST</strong>
        <span>一座島一種冒險</span>
      </div>

      {!selected ? (
        <div className="map-hint">
          拖曳旋轉・捏合縮放
          <br />
          點小島或上方標題即可選擇
        </div>
      ) : null}

      {selected ? (
        <aside className="map-detail" style={{ borderColor: selected.accent }}>
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

