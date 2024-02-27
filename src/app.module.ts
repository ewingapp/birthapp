import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { TaskService } from './task/task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { TaskProcessor } from './task/task.processor';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'birth',
      password: 'birth',
      database: 'birth',
      entities: [User],
      synchronize: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'birthday',
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, TaskService, TaskProcessor],
})
export class AppModule { }
