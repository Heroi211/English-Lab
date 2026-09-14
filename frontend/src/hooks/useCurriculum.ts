import { useEffect, useState } from 'react'
import { loadCurriculum, getCurriculum, type CurriculumIndex } from '../engines/curriculum'

export function useCurriculum() {
  const [data, setData] = useState<CurriculumIndex | null>(getCurriculum())
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!getCurriculum())

  useEffect(() => {
    let alive = true
    if (getCurriculum()) {
      setData(getCurriculum())
      setLoading(false)
      return
    }
    loadCurriculum()
      .then((c) => {
        if (alive) {
          setData(c)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (alive) {
          setError(String(e.message || e))
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [])

  return { data, error, loading }
}
