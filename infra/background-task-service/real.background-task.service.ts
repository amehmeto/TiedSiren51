import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { Platform } from 'react-native'
import {
  BackgroundTaskService,
  TaskOptions,
} from '@/core/_ports_/background-task.service'
import { AppStore } from '@/core/_redux_/createStore'
import { targetSirens } from '@/core/siren/usecases/target-sirens.usecase'

export class RealBackgroundTaskService implements BackgroundTaskService {
  defineTask(
    taskName: string,
    taskFunction: () => Promise<void>,
  ): Promise<void> {
    TaskManager.defineTask(taskName, taskFunction)
    return Promise.resolve()
  }

  async initialize(store: AppStore): Promise<void> {
    TaskManager.defineTask('target-sirens', async () => {
      const now = Date.now()

      store.dispatch(targetSirens())
      // eslint-disable-next-line no-console
      console.log(
        `Got background fetch call at date: ${new Date(now).toISOString()}`,
      )
      /*
      // Be sure to return the successful result type!
      return BackgroundFetch.BackgroundFetchResult.NewData*/
    })
  }

  async scheduleTask(taskName: string, _options?: TaskOptions): Promise<void> {
    if (Platform.OS === 'web') return

    return BackgroundFetch.registerTaskAsync(taskName, {
      minimumInterval: 60 * 1, // 1 minute
      stopOnTerminate: false, // android only,
      startOnBoot: true, // android only
    })
  }

  async cancelTask(taskName: string): Promise<void> {
    return BackgroundFetch.unregisterTaskAsync(taskName)
  }
}
