import {
  Controller,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { SummaryExpenseDto } from './dto/summary-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) { }


  // Microservice Handlers
  @MessagePattern('expense.create')
  async createMicroservice(@Payload() payload: CreateExpenseDto & { userId: string }) {
    const { userId, ...dto } = payload;
    return this.expensesService.create(dto, userId);
  }

  @MessagePattern('expense.findAll')
  async findAllMicroservice(@Payload() payload: QueryExpenseDto & { userId: string }) {
    const { userId, ...query } = payload;
    return this.expensesService.findAll(query, userId);
  }

  @MessagePattern('expense.summary')
  async getSummaryMicroservice(@Payload() payload: SummaryExpenseDto & { userId: string }) {
    const { userId, ...query } = payload;
    return this.expensesService.getSummary(query, userId);
  }

  @MessagePattern('expense.findOne')
  async findOneMicroservice(@Payload() payload: { id: string; userId: string }) {
    const { id, userId } = payload;
    return this.expensesService.findOne(id, userId);
  }

  @MessagePattern('expense.update')
  async updateMicroservice(@Payload() payload: UpdateExpenseDto & { id: string; userId: string }) {
    const { id, userId, ...dto } = payload;
    return this.expensesService.update(id, dto, userId);
  }

  @MessagePattern('expense.remove')
  async removeMicroservice(@Payload() payload: { id: string; userId: string }) {
    const { id, userId } = payload;
    return this.expensesService.remove(id, userId);
  }
}
