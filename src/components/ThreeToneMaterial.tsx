import { useMemo } from 'react'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
varying vec3 vWorldNormal;
void main() {
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uTopColor;
uniform vec3 uLeftColor;
uniform vec3 uRightColor;
varying vec3 vWorldNormal;

void main() {
  vec3 n = normalize(vWorldNormal);
  vec3 finalColor = uRightColor;
  if (n.y > 0.55) {
    finalColor = uTopColor;
  } else if (n.x < -0.35 || n.z > 0.35) {
    finalColor = uLeftColor;
  }
  gl_FragColor = vec4(finalColor, 1.0);
}
`

type Props = {
  top: string
  left: string
  right: string
}

/** 等軸測插畫式三面純色著色（頂／左／右） */
export function ThreeToneMaterial({ top, left, right }: Props) {
  const uniforms = useMemo(
    () => ({
      uTopColor: { value: new THREE.Color(top) },
      uLeftColor: { value: new THREE.Color(left) },
      uRightColor: { value: new THREE.Color(right) },
    }),
    [top, left, right],
  )

  return (
    <shaderMaterial
      key={`${top}-${left}-${right}`}
      uniforms={uniforms}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
    />
  )
}
