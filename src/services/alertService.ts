import { db } from '../db'
import type { AlertLog, AlertType } from '../types'

export async function addAlertLog(
  type: AlertType,
  message: string,
  relatedRecordId?: number,
  relatedRecordType: 'meal' | 'glucose' = 'meal'
): Promise<void> {
  await db.alertLogs.add({
    type,
    message,
    relatedRecordId,
    relatedRecordType,
    timestamp: Date.now(),
    dismissed: false,
  })
}

export async function getUndismissedAlerts(): Promise<AlertLog[]> {
  return db.alertLogs.filter(a => !a.dismissed).sortBy('timestamp')
}

export async function dismissAlert(id: number): Promise<void> {
  await db.alertLogs.update(id, { dismissed: true })
}
