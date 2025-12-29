import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { PrismaService } from '../prisma/prisma.service';
import { OcrEventListener } from './ocr-event.listener';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService, PrismaService, OcrEventListener],
  exports: [ExpensesService],
})
export class ExpensesModule { }
