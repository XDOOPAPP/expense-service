import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto, UpdateDebtDto } from './debts.dto';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  private getUserId(headers: any): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return userId;
  }

  @Get()
  async findAll(@Headers() headers: any) {
    const userId = this.getUserId(headers);
    return {
      success: true,
      data: await this.debtsService.findAll(userId),
    };
  }

  @Get('summary')
  async getSummary(@Headers() headers: any) {
    const userId = this.getUserId(headers);
    return {
      success: true,
      data: await this.debtsService.getSummary(userId),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Headers() headers: any) {
    const userId = this.getUserId(headers);
    const debt = await this.debtsService.findOne(id, userId);
    
    if (!debt) {
      throw new HttpException('Debt not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: debt,
    };
  }

  @Post()
  async create(@Body() dto: CreateDebtDto, @Headers() headers: any) {
    const userId = this.getUserId(headers);
    const debt = await this.debtsService.create(userId, dto);

    return {
      success: true,
      data: debt,
      message: 'Debt created successfully',
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDebtDto,
    @Headers() headers: any,
  ) {
    const userId = this.getUserId(headers);
    const debt = await this.debtsService.update(id, userId, dto);

    if (!debt) {
      throw new HttpException('Debt not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: debt,
      message: 'Debt updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Headers() headers: any) {
    const userId = this.getUserId(headers);
    const deleted = await this.debtsService.remove(id, userId);

    if (!deleted) {
      throw new HttpException('Debt not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      message: 'Debt deleted successfully',
    };
  }
}
