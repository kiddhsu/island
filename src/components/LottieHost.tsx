import { LottieSvg } from 'lottie-react'

type Props = {
  animationData: object
  loop?: boolean
}

export default function LottieHost({ animationData, loop = false }: Props) {
  return (
    <LottieSvg
      src={animationData}
      loop={loop}
      autoplay
      style={{ width: '100%', height: 'auto' }}
    />
  )
}
