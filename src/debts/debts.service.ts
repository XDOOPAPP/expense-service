import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDebtDto, UpdateDebtDto } from './debts.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const debts = await this.prisma.debt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return debts.map(d => ({
      ...d,
      amount: Number(d.amount),
    }));
  }

  async findOne(id: string, userId: string) {
    const debt = await this.prisma.debt.findFirst({
      where: { id, userId },
    });

    if (!debt) return null;

    return {
      ...debt,
      amount: Number(debt.amount),
    };
  }

  async create(userId: string, dto: CreateDebtDto) {
    const debt = await this.prisma.debt.create({
      data: {
        userId,
        person: dto.person,
        amount: new Decimal(dto.amount),
        note: dto.note,
        type: dto.type,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });

    return {
      ...debt,
      amount: Number(debt.amount),
    };
  }

  async update(id: string, userId: string, dto: UpdateDebtDto) {
    const debt = await this.prisma.debt.updateMany({
      where: { id, userId },
      data: {
        ...(dto.person && { person: dto.person }),
        ...(dto.amount !== undefined && { amount: new Decimal(dto.amount) }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.type && { type: dto.type }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...(dto.isPaid !== undefined && { isPaid: dto.isPaid }),
      },
    });

    if (debt.count === 0) return null;

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const result = await this.prisma.debt.deleteMany({
      where: { id, userId },
    });

    return result.count > 0;
  }

  async getSummary(userId: string) {
    const debts = await this.prisma.debt.findMany({
      where: { userId, isPaid: false },
    });

    const totals = debts.reduce(
      (acc, d) => {
        const amount = Number(d.amount);
        if (d.type === 'owe') acc.owe += amount;
        else acc.owed += amount;
        return acc;
      },
      { owe: 0, owed: 0 },
    );

    return {
      totalOwe: totals.owe,
      totalOwed: totals.owed,
      netBalance: totals.owed - totals.owe,
      count: debts.length,
    };
  }
}
