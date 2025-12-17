import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { Platform } from 'react-native'
import {
  BackgroundTaskService,
  TaskOptions,
} from '@/core/_ports_/background-task.service'
import { Logger } from '@/core/_ports_/logger'
import { AppStore } from '@/core/_redux_/createStore'
import { targetSirens } from '@/core/siren/usecases/target-sirens.usecase'

export class RealBackgroundTaskService implements BackgroundTaskService {
  constructor(private readonly logger: Logger) {}

  defineTask(
    taskName: string,
    taskFunction: () => Promise<void>,
  ): Promise<void> {
    try {
      TaskManager.defineTask(taskName, taskFunction)
      return Promise.resolve()
    } catch (error) {
      this.logger.error(
        `[RealBackgroundTaskService] Failed to define task "${taskName}": ${error}`,
      )
      throw error
    }
  }

  async initialize(store: AppStore): Promise<void> {
    try {
      TaskManager.defineTask('target-sirens', async () => {
        const now = Date.now()

        store.dispatch(targetSirens())
        this.logger.info(
          `Got background fetch call at date: ${new Date(now).toISOString()}`,
        )
      })
    } catch (error) {
      this.logger.error(
        `[RealBackgroundTaskService] Failed to initialize: ${error}`,
      )
      throw error
    }
  }

  async scheduleTask(taskName: string, _options?: TaskOptions): Promise<void> {
    try {
      if (Platform.OS === 'web') return

      return BackgroundFetch.registerTaskAsync(taskName, {
        minimumInterval: 60 * 1, // 1 minute
        stopOnTerminate: false, // android only,
        startOnBoot: true, // android only
      })
    } catch (error) {
      this.logger.error(
        `[RealBackgroundTaskService] Failed to schedule task "${taskName}": ${error}`,
      )
      throw error
    }
  }

  async cancelTask(taskName: string): Promise<void> {
    try {
      return BackgroundFetch.unregisterTaskAsync(taskName)
    } catch (error) {
      this.logger.error(
        `[RealBackgroundTaskService] Failed to cancel task "${taskName}": ${error}`,
      )
      throw error
    }
  }
}
