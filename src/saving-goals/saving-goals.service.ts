import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingGoalDto, UpdateSavingGoalDto } from './saving-goals.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SavingGoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const goals = await this.prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map(g => ({
      ...g,
      targetAmount: Number(g.targetAmount),
      currentAmount: Number(g.currentAmount),
      progress: Number(g.targetAmount) > 0 
        ? Math.min(100, (Number(g.currentAmount) / Number(g.targetAmount)) * 100)
        : 0,
    }));
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.savingGoal.findFirst({
      where: { id, userId },
    });

    if (!goal) return null;

    return {
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      progress: Number(goal.targetAmount) > 0 
        ? Math.min(100, (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100)
        : 0,
    };
  }

  async create(userId: string, dto: CreateSavingGoalDto) {
    const goal = await this.prisma.savingGoal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: new Decimal(dto.targetAmount),
        currentAmount: new Decimal(dto.currentAmount || 0),
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        icon: dto.icon,
        color: dto.color,
      },
    });

    return {
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      progress: 0,
    };
  }

  async update(id: string, userId: string, dto: UpdateSavingGoalDto) {
    const existingGoal = await this.prisma.savingGoal.findFirst({
      where: { id, userId },
    });

    if (!existingGoal) return null;

    const goal = await this.prisma.savingGoal.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.targetAmount !== undefined && { targetAmount: new Decimal(dto.targetAmount) }),
        ...(dto.currentAmount !== undefined && { currentAmount: new Decimal(dto.currentAmount) }),
        ...(dto.deadline !== undefined && { deadline: dto.deadline ? new Date(dto.deadline) : null }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.isCompleted !== undefined && { isCompleted: dto.isCompleted }),
      },
    });

    return {
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      progress: Number(goal.targetAmount) > 0 
        ? Math.min(100, (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100)
        : 0,
    };
  }

  async contribute(id: string, userId: string, amount: number) {
    const goal = await this.prisma.savingGoal.findFirst({
      where: { id, userId },
    });

    if (!goal) return null;

    const newAmount = Number(goal.currentAmount) + amount;
    const isCompleted = newAmount >= Number(goal.targetAmount);

    const updated = await this.prisma.savingGoal.update({
      where: { id },
      data: {
        currentAmount: new Decimal(newAmount),
        isCompleted,
      },
    });

    return {
      ...updated,
      targetAmount: Number(updated.targetAmount),
      currentAmount: Number(updated.currentAmount),
      progress: Number(updated.targetAmount) > 0 
        ? Math.min(100, (newAmount / Number(updated.targetAmount)) * 100)
        : 0,
    };
  }

  async remove(id: string, userId: string) {
    const result = await this.prisma.savingGoal.deleteMany({
      where: { id, userId },
    });

    return result.count > 0;
  }

  async getSummary(userId: string) {
    const goals = await this.prisma.savingGoal.findMany({
      where: { userId },
    });

    const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
    const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    const completedCount = goals.filter(g => g.isCompleted).length;

    return {
      totalGoals: goals.length,
      completedGoals: completedCount,
      activeGoals: goals.length - completedCount,
      totalTarget,
      totalSaved,
      overallProgress: totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0,
    };
  }
}
