import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { SummaryExpenseDto } from './dto/summary-expense.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) { }


  // Microservice Handlers
  @MessagePattern('expense.create')
  @Auth()
  async createMicroservice(@Payload() payload: CreateExpenseDto & { userId: string }) {
    const { userId, ...dto } = payload;
    return this.expensesService.create(dto, userId);
  }

  @MessagePattern('expense.findAll')
  @Auth()
  async findAllMicroservice(@Payload() payload: QueryExpenseDto & { userId: string }) {
    const { userId, ...query } = payload;
    return this.expensesService.findAll(query, userId);
  }

  @MessagePattern('expense.summary')
  @Auth()
  async getSummaryMicroservice(@Payload() payload: SummaryExpenseDto & { userId: string }) {
    const { userId, ...query } = payload;
    return this.expensesService.getSummary(query, userId);
  }

  @MessagePattern('expense.findOne')
  @Auth()
  async findOneMicroservice(@Payload() payload: { id: string; userId: string }) {
    const { id, userId } = payload;
    return this.expensesService.findOne(id, userId);
  }

  @MessagePattern('expense.update')
  @Auth()
  async updateMicroservice(@Payload() payload: UpdateExpenseDto & { id: string; userId: string }) {
    const { id, userId, ...dto } = payload;
    return this.expensesService.update(id, dto, userId);
  }

  @MessagePattern('expense.remove')
  @Auth()
  async removeMicroservice(@Payload() payload: { id: string; userId: string }) {
    const { id, userId } = payload;
    return this.expensesService.remove(id, userId);
  }
}
