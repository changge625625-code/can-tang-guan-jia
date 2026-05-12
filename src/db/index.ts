import Dexie, { type Table } from 'dexie'
import type { GlucoseRecord, MealRecord, AppSettings, AlertLog } from '../types'

export class DiabetesDB extends Dexie {
  glucoseRecords!: Table<GlucoseRecord, number>
  mealRecords!: Table<MealRecord, number>
  settings!: Table<AppSettings, number>
  alertLogs!: Table<AlertLog, number>

  constructor() {
    super('DiabetesSugarControl')

    this.version(1).stores({
      glucoseRecords: '++id, timestamp, type',
      mealRecords: '++id, timestamp, mealType, reviewStatus, reviewScore',
      settings: '++id',
      alertLogs: '++id, timestamp, type, dismissed',
    })
  }
}

export const db = new DiabetesDB()
