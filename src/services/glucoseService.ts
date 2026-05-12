import { db } from '../db'
import type { GlucoseRecord } from '../types'

export async function addGlucose(record: Omit<GlucoseRecord, 'id' | 'createdAt'>): Promise<number> {
  return db.glucoseRecords.add({ ...record, createdAt: Date.now() })
}

export async function getRecentGlucose(limit = 3): Promise<GlucoseRecord[]> {
  return db.glucoseRecords.orderBy('timestamp').reverse().limit(limit).toArray()
}

export async function getGlucoseInRange(start: number, end: number): Promise<GlucoseRecord[]> {
  return db.glucoseRecords
    .where('timestamp')
    .between(start, end, true, true)
    .sortBy('timestamp')
}

export async function getTodayStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayRecords = await db.glucoseRecords
    .where('timestamp')
    .aboveOrEqual(today.getTime())
    .sortBy('timestamp')

  if (todayRecords.length === 0) return { count: 0, max: 0, min: 0, avg: 0, latest: null }

  const values = todayRecords.map((r) => r.value)
  return {
    count: todayRecords.length,
    max: Math.max(...values),
    min: Math.min(...values),
    avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
    latest: todayRecords[todayRecords.length - 1],
  }
}

export async function getAllGlucose(): Promise<GlucoseRecord[]> {
  return db.glucoseRecords.orderBy('timestamp').reverse().toArray()
}
