import { useCallback, useEffect, useState } from 'react'

/** 開場倒數完成前鎖定操作 */
export function usePlayReady(resetKey: string) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
  }, [resetKey])

  const onReady = useCallback(() => setReady(true), [])

  return { ready, onReady }
}
