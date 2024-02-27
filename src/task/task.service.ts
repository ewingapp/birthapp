import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { UserService } from 'src/user/user.service';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosResponse } from 'axios';

dayjs.extend(timezone);
dayjs.extend(utc);

@Injectable()
export class TaskService {
    constructor(
        private readonly userService: UserService,
        private readonly httpService: HttpService,
        @InjectQueue('birthday') private readonly birthdayQueue: Queue,
    ) { }

    @Cron(CronExpression.EVERY_6_HOURS)
    async scheduleBirthdayMessages() {
        const users = await this.userService.findByBirthdayToday()

        if (users.length <= 0) {
            console.log("No user birthday in this day")
            return
        }

        users.forEach(async (user, index) => {
            // Calculate the delay until 9 AM in the user's timezone
            const now = dayjs().tz(user.timezone);
            const desiredExecutionTime = now.startOf('day').add(9, 'hours');
            const delay = desiredExecutionTime.diff(now, 'milliseconds');

            console.log("Send birthday message to User: ", user.first_name)

            await this.birthdayQueue.add('sendBirthdayMessage', { userId: user.id }, { delay });
        })
    }

    async sendBirthdayMessage(jobData: { userId: number }): Promise<AxiosResponse> {
        const { userId } = jobData;
        const user = await this.userService.findOne(userId);
        const birthdayMessage = `Happy Birthday, ${user.first_name}! 🎉🎂`;

        return axios.post('https://email-service.digitalenvision.com.au/send-email', { email: user.email, message: birthdayMessage });
    }
}
