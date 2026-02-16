import { AppStore } from '../_redux_/createStore'

type TaskIcon = {
  name: string
  type: string
}

type TaskParameters = {
  delay: number
}

export type TaskOptions = {
  taskName: string
  taskTitle: string
  taskDesc: string
  taskIcon: TaskIcon
  color: string
  linkingURI: string
  parameters: TaskParameters
}

export type Task = (options: TaskOptions) => Promise<void>

export interface BackgroundTaskService {
  scheduleTask(task: string, options?: TaskOptions): Promise<void>
  cancelTask(taskId: string): Promise<void>
  initialize(store?: AppStore): Promise<void>
  defineTask(taskName: string, taskFunction: () => Promise<void>): Promise<void>
}
