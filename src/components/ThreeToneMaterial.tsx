import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

type BoxProps = {
  args?: [number, number, number]
  top: string
  left: string
  right: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  castShadow?: boolean
  receiveShadow?: boolean
}

/**
 * 分面著色方塊（非 GLSL）：六面材質陣列，Safari 相容。
 * Box 面序：+x, -x, +y, -y, +z, -z
 */
export function ThreeToneBox({
  args = [1, 1, 1],
  top,
  left,
  right,
  position,
  rotation,
  castShadow = true,
  receiveShadow = false,
}: BoxProps) {
  const materials = useMemo(() => {
    const mk = (color: string) =>
      new THREE.MeshStandardMaterial({
        color,
        flatShading: true,
        roughness: 0.84,
        metalness: 0.02,
      })
    return [
      mk(right), // +x
      mk(left), // -x
      mk(top), // +y
      mk(right), // -y
      mk(left), // +z
      mk(right), // -z
    ]
  }, [top, left, right])

  useEffect(() => {
    return () => {
      for (const m of materials) m.dispose()
    }
  }, [materials])

  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      material={materials}
    >
      <boxGeometry args={args} />
    </mesh>
  )
}
