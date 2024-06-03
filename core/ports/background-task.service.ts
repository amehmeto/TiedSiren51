import { AppStore } from '../_redux_/createStore'

export type TaskOptions = {
  taskName: string
  taskTitle: string
  taskDesc: string
  taskIcon: {
    name: string
    type: string
  }
  color: string
  linkingURI: string
  parameters: {
    delay: number
  }
}

export type Task = (options: TaskOptions) => Promise<void>

export interface BackgroundTaskService {
  scheduleTask(task: string, options?: TaskOptions): Promise<void>
  cancelTask(taskId: string): Promise<void>
  initialize(store?: AppStore): Promise<void>
  defineTask(taskName: string, taskFunction: () => Promise<void>): Promise<void>
}
