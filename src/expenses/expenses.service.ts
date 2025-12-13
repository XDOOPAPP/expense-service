import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { SummaryExpenseDto, GroupByPeriod } from './dto/summary-expense.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: string,
  ): Promise<Record<string, unknown>> {
    // Validate category if provided
    if (createExpenseDto.category) {
      await this.validateCategory(createExpenseDto.category);
    }

    const expense = await this.prisma.expense.create({
      data: {
        userId,
        description: createExpenseDto.description,
        amount: createExpenseDto.amount,
        category: createExpenseDto.category,
        spentAt: new Date(createExpenseDto.spentAt),
      },
    });

    return this.transformExpense(expense);
  }

  async findAll(
    query: QueryExpenseDto,
    userId: string,
  ): Promise<{
    data: Record<string, unknown>[];
    meta: Record<string, unknown>;
  }> {
    const { from, to, category, page = 1, limit = 10 } = query;

    // Build where clause
    const where: Prisma.ExpenseWhereInput = {
      userId,
      ...(category && { category }),
      ...(from || to
        ? {
            spentAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    // Execute queries in parallel
    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        orderBy: {
          spentAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses.map((e) => this.transformExpense(e)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        timestamp: new Date().toISOString(),
      },
    };
  }

  async findOne(id: string, userId: string): Promise<Record<string, unknown>> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    // Check ownership
    if (expense.userId !== userId) {
      throw new ForbiddenException('You do not have access to this expense');
    }

    return this.transformExpense(expense);
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    userId: string,
  ): Promise<Record<string, unknown>> {
    // Check if expense exists and user owns it
    await this.findOne(id, userId);

    // Validate category if provided
    if (updateExpenseDto.category) {
      await this.validateCategory(updateExpenseDto.category);
    }

    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(updateExpenseDto.description && {
          description: updateExpenseDto.description,
        }),
        ...(updateExpenseDto.amount !== undefined && {
          amount: updateExpenseDto.amount,
        }),
        ...(updateExpenseDto.category !== undefined && {
          category: updateExpenseDto.category,
        }),
        ...(updateExpenseDto.spentAt && {
          spentAt: new Date(updateExpenseDto.spentAt),
        }),
      },
    });

    return this.transformExpense(expense);
  }

  async remove(id: string, userId: string): Promise<Record<string, string>> {
    // Check if expense exists and user owns it
    await this.findOne(id, userId);

    await this.prisma.expense.delete({
      where: { id },
    });

    return {
      message: 'Expense deleted successfully',
    };
  }

  async getSummary(
    query: SummaryExpenseDto,
    userId: string,
  ): Promise<Record<string, unknown>> {
    const { from, to, groupBy } = query;

    // Build where clause
    const where: Prisma.ExpenseWhereInput = {
      userId,
      ...(from || to
        ? {
            spentAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    // Get total and by category
    const [totalResult, byCategory] = await Promise.all([
      this.prisma.expense.aggregate({
        where,
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      this.prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: {
          amount: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      }),
    ]);

    // Format by category
    const byCategoryFormatted = byCategory.map((item) => ({
      category: item.category || 'uncategorized',
      total: item._sum.amount ? parseFloat(item._sum.amount.toString()) : 0,
      count: item._count,
    }));

    const result: Record<string, unknown> = {
      total: totalResult._sum.amount
        ? parseFloat(totalResult._sum.amount.toString())
        : 0,
      count: totalResult._count,
      byCategory: byCategoryFormatted,
    };

    // Group by time period if requested
    if (groupBy) {
      const expenses = await this.prisma.expense.findMany({
        where,
        select: {
          spentAt: true,
          amount: true,
        },
        orderBy: {
          spentAt: 'asc',
        },
      });

      result.byTimePeriod = this.groupByTimePeriod(expenses, groupBy);
    }

    return result;
  }

  private groupByTimePeriod(
    expenses: Array<{ spentAt: Date; amount: Prisma.Decimal }>,
    groupBy: GroupByPeriod,
  ): Array<{ period: string; total: number; count: number }> {
    const grouped = new Map<string, { total: number; count: number }>();

    expenses.forEach((expense) => {
      let key: string;
      const date = new Date(expense.spentAt);

      switch (groupBy) {
        case GroupByPeriod.DAY:
          key = date.toISOString().split('T')[0];
          break;
        case GroupByPeriod.WEEK: {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        }
        case GroupByPeriod.MONTH:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case GroupByPeriod.YEAR:
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      const current = grouped.get(key) || { total: 0, count: 0 };
      current.total += parseFloat(expense.amount.toString());
      current.count += 1;
      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .map(([period, data]) => ({
        period,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private async validateCategory(categorySlug: string): Promise<{
    slug: string;
    name: string;
  }> {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with slug "${categorySlug}" does not exist`,
      );
    }

    return category;
  }

  private transformExpense(
    expense: Prisma.ExpenseGetPayload<object>,
  ): Record<string, unknown> {
    return {
      ...expense,
      amount: parseFloat(expense.amount.toString()),
    };
  }
}
