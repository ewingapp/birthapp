// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id }
    })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const { first_name, last_name, email, birthday, location, timezone } = createUserDto
    const defaultTimezone = dayjs.tz.guess()
    const user = this.userRepository.create({
      first_name,
      last_name,
      email,
      birthday,
      location,
      timezone: timezone ? timezone : defaultTimezone
    });
    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByBirthdayToday(): Promise<User[]> {
    const today = dayjs().format('YYYY-MM-DD');
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where(`DAY(user.birthday) = DAY(:today) AND MONTH(user.birthday) = MONTH(:today)`, { today })
      .getMany();

    return users;
  }
}
