import { db } from '../db'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../utils/constants'

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.toCollection().first()
  if (!settings) {
    await db.settings.add({ ...DEFAULT_SETTINGS } as AppSettings)
    return { ...DEFAULT_SETTINGS } as AppSettings
  }
  return settings
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  const all = await db.settings.toCollection().primaryKeys()
  if (all.length > 0) {
    await db.settings.update(all[0], { ...updates, updatedAt: Date.now() })
  }
}
