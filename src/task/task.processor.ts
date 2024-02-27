// src/birthday/birthday.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TaskService } from './task.service';

@Processor('birthday')
export class TaskProcessor {
    constructor(private readonly taskService: TaskService) { }

    @Process('sendBirthdayMessage')
    async sendBirthdayMessage(job: Job<{ userId: number, email: string }>) {
        const { userId, email } = job.data;
        await this.taskService.sendBirthdayMessage({ userId, email });
    }
}
