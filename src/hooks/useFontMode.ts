import { useEffect, useState } from 'react'
import { getSettings, updateSettings } from '../services/settingsService'
import type { FontMode } from '../types'

export function useFontMode(): [FontMode, (mode: FontMode) => Promise<void>] {
  const [mode, setMode] = useState<FontMode>('normal')

  useEffect(() => {
    getSettings().then((s) => {
      const m = s.fontMode || 'normal'
      setMode(m)
    })
  }, [])

  // 同步到 DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-font-mode', mode)
  }, [mode])

  const setFontMode = async (m: FontMode) => {
    setMode(m)
    await updateSettings({ fontMode: m })
  }

  return [mode, setFontMode]
}
