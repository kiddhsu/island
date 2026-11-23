import { Canvas } from '@react-three/fiber'
import { Float, Html, OrbitControls } from '@react-three/drei'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ISLANDS, islandPosition, type IslandMeta } from '../data/islands'
import { playSfx } from '../lib/sfx'
import * as THREE from 'three'

function IslandMesh({
  island,
  selected,
  onSelect,
}: {
  island: IslandMeta
  selected: boolean
  onSelect: () => void
}) {
  const pos = useMemo(() => islandPosition(island), [island])
  const color = useMemo(() => new THREE.Color(island.accent), [island.accent])
  const soft = useMemo(() => new THREE.Color(island.soft), [island.soft])

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.45}>
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
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.85, 1.15, 0.45, 6]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <coneGeometry args={[0.55, 0.7, 5]} />
          <meshStandardMaterial color={soft} flatShading />
        </mesh>
        {selected ? (
          <mesh position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial
              color="#f8d878"
              emissive="#f8d878"
              emissiveIntensity={0.9}
            />
          </mesh>
        ) : null}
        <Html position={[0, 1.55, 0]} center distanceFactor={10} zIndexRange={[10, 0]}>
          <div
            style={{
              fontFamily: 'Press Start 2P, Noto Sans TC, monospace',
              fontSize: 9,
              color: '#fff',
              background: 'rgba(0,0,0,0.75)',
              border: '3px solid #fff',
              padding: '6px 8px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              textShadow: '2px 2px 0 #000',
            }}
          >
            {island.name}
          </div>
        </Html>
      </group>
    </Float>
  )
}

function Sea() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[9.5, 48]} />
        <meshStandardMaterial color="#3a6fd8" flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.6, 6]} />
        <meshStandardMaterial color="#e8d090" flatShading />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.5, 1.1, 0.5]} />
        <meshStandardMaterial color="#e52521" flatShading />
      </mesh>
    </>
  )
}

export function IslandWorld3D({
  starsMap,
}: {
  starsMap: Record<string, number>
}) {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = ISLANDS.find((i) => i.id === selectedId) ?? null

  return (
    <div className="map-3d-wrap">
      <Canvas
        shadows
        camera={{ position: [0, 7.5, 9.5], fov: 42 }}
        dpr={[1, 1.75]}
      >
        <color attach="background" args={['#1a1c4b']} />
        <ambientLight intensity={0.85} />
        <directionalLight
          castShadow
          position={[6, 10, 4]}
          intensity={1.35}
          shadow-mapSize={[1024, 1024]}
        />
        <Sea />
        {ISLANDS.map((island) => (
          <IslandMesh
            key={island.id}
            island={island}
            selected={selectedId === island.id}
            onSelect={() => {
              playSfx('tap', 0.35)
              setSelectedId(island.id)
            }}
          />
        ))}
        <OrbitControls
          enablePan={false}
          minDistance={7}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2.15}
          target={[0, 0.4, 0]}
        />
      </Canvas>

      <div className="map-hint">
        拖曳旋轉・捏合縮放・點島選關
        {selected ? (
          <>
            <br />
            {selected.name} ★{starsMap[selected.id] ?? 0}/3
            <br />
            <button
              type="button"
              className="nes-btn"
              style={{ marginTop: 8 }}
              onClick={() => {
                playSfx('enter', 0.45)
                navigate(`/island/${selected.id}`)
              }}
            >
              進入關卡
            </button>
          </>
        ) : (
          <>
            <br />
            點一座小島開始
          </>
        )}
      </div>
    </div>
  )
}
