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
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) { }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUser('userId') userId: string,
  ): Promise<Record<string, unknown>> {
    return this.expensesService.create(createExpenseDto, userId);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all expenses with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Returns list of expenses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() query: QueryExpenseDto,
    @CurrentUser('userId') userId: string,
  ): Promise<{
    data: Record<string, unknown>[];
    meta: Record<string, unknown>;
  }> {
    return this.expensesService.findAll(query, userId);
  }

  @Get('summary')
  @Auth()
  @ApiOperation({ summary: 'Get expense summary and statistics' })
  @ApiResponse({ status: 200, description: 'Returns expense summary' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSummary(
    @Query() query: SummaryExpenseDto,
    @CurrentUser('userId') userId: string,
  ): Promise<Record<string, unknown>> {
    return this.expensesService.getSummary(query, userId);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiParam({ name: 'id', description: 'Expense ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returns expense details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<Record<string, unknown>> {
    return this.expensesService.findOne(id, userId);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update expense' })
  @ApiParam({ name: 'id', description: 'Expense ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @CurrentUser('userId') userId: string,
  ): Promise<Record<string, unknown>> {
    return this.expensesService.update(id, updateExpenseDto, userId);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete expense' })
  @ApiParam({ name: 'id', description: 'Expense ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<Record<string, unknown>> {
    return this.expensesService.remove(id, userId);
  }

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
