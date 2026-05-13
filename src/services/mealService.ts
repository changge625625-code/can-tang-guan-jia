import { db } from '../db'
import type { MealRecord } from '../types'

export async function addMeal(record: Omit<MealRecord, 'id' | 'createdAt' | 'reviewStatus'>): Promise<number> {
  return db.mealRecords.add({
    ...record,
    reviewStatus: 'pending',
    createdAt: Date.now(),
  })
}

export async function updateMeal(id: number, updates: Partial<MealRecord>): Promise<void> {
  await db.mealRecords.update(id, updates)
}

export async function getMeal(id: number): Promise<MealRecord | undefined> {
  return db.mealRecords.get(id)
}

export async function getRecentMeals(limit = 5): Promise<MealRecord[]> {
  return db.mealRecords.orderBy('timestamp').reverse().limit(limit).toArray()
}

export async function getTodayMeals(): Promise<MealRecord[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return db.mealRecords
    .where('timestamp')
    .aboveOrEqual(today.getTime())
    .sortBy('timestamp')
}

export async function getAllMeals(): Promise<MealRecord[]> {
  return db.mealRecords.orderBy('timestamp').reverse().toArray()
}

export async function deleteMeal(id: number): Promise<void> {
  await db.mealRecords.delete(id)
}
