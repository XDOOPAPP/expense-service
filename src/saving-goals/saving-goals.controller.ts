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
import { SavingGoalsService } from './saving-goals.service';
import { CreateSavingGoalDto, UpdateSavingGoalDto, ContributeDto } from './saving-goals.dto';

@Controller('saving-goals')
export class SavingGoalsController {
  constructor(private readonly savingGoalsService: SavingGoalsService) {}

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
      data: await this.savingGoalsService.findAll(userId),
    };
  }

  @Get('summary')
  async getSummary(@Headers() headers: any) {
    const userId = this.getUserId(headers);
    return {
      success: true,
      data: await this.savingGoalsService.getSummary(userId),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Headers() headers: any) {
    const userId = this.getUserId(headers);
    const goal = await this.savingGoalsService.findOne(id, userId);
    
    if (!goal) {
      throw new HttpException('Saving goal not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: goal,
    };
  }

  @Post()
  async create(@Body() dto: CreateSavingGoalDto, @Headers() headers: any) {
    const userId = this.getUserId(headers);
    const goal = await this.savingGoalsService.create(userId, dto);

    return {
      success: true,
      data: goal,
      message: 'Saving goal created successfully',
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSavingGoalDto,
    @Headers() headers: any,
  ) {
    const userId = this.getUserId(headers);
    const goal = await this.savingGoalsService.update(id, userId, dto);

    if (!goal) {
      throw new HttpException('Saving goal not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: goal,
      message: 'Saving goal updated successfully',
    };
  }

  @Post(':id/contribute')
  async contribute(
    @Param('id') id: string,
    @Body() dto: ContributeDto,
    @Headers() headers: any,
  ) {
    const userId = this.getUserId(headers);
    const goal = await this.savingGoalsService.contribute(id, userId, dto.amount);

    if (!goal) {
      throw new HttpException('Saving goal not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: goal,
      message: goal.isCompleted 
        ? '🎉 Chúc mừng! Bạn đã đạt mục tiêu!' 
        : 'Contribution added successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Headers() headers: any) {
    const userId = this.getUserId(headers);
    const deleted = await this.savingGoalsService.remove(id, userId);

    if (!deleted) {
      throw new HttpException('Saving goal not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      message: 'Saving goal deleted successfully',
    };
  }
}
