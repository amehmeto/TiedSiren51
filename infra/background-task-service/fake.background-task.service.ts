import {
  BackgroundTaskService,
  TaskOptions,
} from '@/core/ports/background-task.service'

export class FakeBackgroundTaskService implements BackgroundTaskService {
  lastScheduledTasks: string[] = []

  async scheduleTask(taskName: string, _options: TaskOptions): Promise<void> {
    this.lastScheduledTasks.push(taskName)
  }

  async cancelTask(taskId: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('FakeBackgroundTaskService.cancelTask', taskId)
  }

  defineTask(
    _taskName: string,
    _taskFunction: () => Promise<void>,
  ): Promise<void> {
    return Promise.resolve(undefined)
  }

  initialize(): Promise<void> {
    return Promise.resolve(undefined)
  }
}
