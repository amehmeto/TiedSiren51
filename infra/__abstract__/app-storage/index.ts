/* eslint-disable import/no-unresolved */
import { AppStorage } from '@/core/ports/app-storage'
import { PrismaAppStorage } from '@/infra/prisma/databaseService'

export const appStorage: AppStorage = PrismaAppStorage.getInstance()

export function useAppStorage(): AppStorage {
  return appStorage
}
