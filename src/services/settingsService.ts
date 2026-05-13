import { db } from '../db'
import type { AppSettings, FontMode } from '../types'
import { DEFAULT_SETTINGS } from '../utils/constants'

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.toCollection().first()
  if (!settings) {
    const defaults = { ...DEFAULT_SETTINGS, fontMode: detectSystemFontMode() }
    await db.settings.add(defaults as AppSettings)
    return defaults as AppSettings
  }
  // 兼容旧数据：如果没有 fontMode 字段，自动检测
  if (!settings.fontMode) {
    settings.fontMode = detectSystemFontMode()
    await updateSettings({ fontMode: settings.fontMode })
  }
  return settings
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  const all = await db.settings.toCollection().primaryKeys()
  if (all.length > 0) {
    await db.settings.update(all[0], { ...updates, updatedAt: Date.now() })
  }
}

/** 自动检测系统字体大小偏好，判断是否为老年/大字模式 */
function detectSystemFontMode(): FontMode {
  try {
    // 检测系统是否设置了更大的字体
    // 方法：测量实际渲染的字体大小与预期的比例
    const testEl = document.createElement('div')
    testEl.style.cssText = 'position:absolute;visibility:hidden;font-size:16px;height:1em;width:1em;'
    testEl.textContent = 'M'
    document.body.appendChild(testEl)
    const actualSize = testEl.getBoundingClientRect().height
    document.body.removeChild(testEl)
    // 如果实际字体大小比 16px 大超过 10%，判定为大字模式
    if (actualSize > 17.6) return 'large'

    // 也检查 CSS prefers 相关媒体查询
    if (window.matchMedia('(prefers-contrast: high)').matches) return 'large'
  } catch {
    // 检测失败，保持 normal
  }
  return 'normal'
}
