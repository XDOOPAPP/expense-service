import { Module } from '@nestjs/common';
import { SavingGoalsController } from './saving-goals.controller';
import { SavingGoalsService } from './saving-goals.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SavingGoalsController],
  providers: [SavingGoalsService, PrismaService],
  exports: [SavingGoalsService],
})
export class SavingGoalsModule {}
