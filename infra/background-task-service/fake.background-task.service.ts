import {
  BackgroundTaskService,
  TaskOptions,
} from '@/core/_ports_/background-task.service'
import { Logger } from '@/core/_ports_/logger'

export class FakeBackgroundTaskService implements BackgroundTaskService {
  lastScheduledTasks: string[] = []

  constructor(private readonly logger: Logger) {}

  async scheduleTask(taskName: string, _options: TaskOptions): Promise<void> {
    this.lastScheduledTasks.push(taskName)
  }

  async cancelTask(taskId: string): Promise<void> {
    this.logger.info(`FakeBackgroundTaskService.cancelTask ${taskId}`)
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
