import { useCallback, useEffect, useState } from 'react'

/**
 * 開場倒數完成前鎖定操作。
 * countdown=false 時（換題後）直接 ready，不再 3 秒倒數。
 */
export function usePlayReady(resetKey: string, countdown = true) {
  const [ready, setReady] = useState(!countdown)

  useEffect(() => {
    setReady(!countdown)
  }, [resetKey, countdown])

  const onReady = useCallback(() => setReady(true), [])

  return { ready, onReady, countdown }
}
