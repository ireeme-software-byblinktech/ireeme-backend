import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class FinanceRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findOrCreateFeeRecord(studentId: string, termId: string, totalFee: number, schoolId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.feeRecord.findFirst({
        where: { schoolId, studentId, termId },
        include: {
          transactions: {
            orderBy: { paidAt: 'desc' },
          },
        },
      });

      if (existing) {
        return existing;
      }

      return tx.feeRecord.create({
        data: {
          schoolId,
          studentId,
          termId,
          totalFee,
          amountPaid: 0,
          status: PaymentStatus.PENDING,
        },
        include: {
          transactions: {
            orderBy: { paidAt: 'desc' },
          },
        },
      });
    });
  }

  createTransaction(data: {
    schoolId: string;
    feeRecordId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
  }) {
    return this.prisma.transaction.create({
      data,
    });
  }

  updateFeeRecord(
    id: string,
    schoolId: string,
    data: { amountPaid: number; status: PaymentStatus },
  ) {
    return this.prisma.feeRecord.update({
      where: { id },
      data,
      include: {
        transactions: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });
  }

  getFeeRecord(studentId: string, schoolId: string) {
    return this.prisma.feeRecord.findFirst({
      where: this.scopeToSchool(schoolId, { studentId }),
      include: {
        transactions: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });
  }

  getTransactions(
    schoolId: string,
    page: number,
    limit: number,
    filters?: {
      studentId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const where: any = { schoolId };

    if (filters?.studentId) {
      where.feeRecord = { studentId: filters.studentId };
    }

    if (filters?.startDate || filters?.endDate) {
      where.paidAt = {};
      if (filters.startDate) {
        where.paidAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.paidAt.lte = filters.endDate;
      }
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        feeRecord: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findStockItem(id: string, schoolId: string) {
    return this.prisma.stockItem.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
    });
  }

  decrementStock(id: string, schoolId: string, qty: number) {
    return this.prisma.stockItem.update({
      where: { id },
      data: {
        quantity: {
          decrement: qty,
        },
      },
    });
  }

  createStockSale(data: { schoolId: string; itemId: string; studentId: string; qty: number }) {
    return this.prisma.stockSale.create({
      data,
      include: {
        item: true,
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getDashboardTotals(schoolId: string) {
    const [aggregates, studentCount, recentTransactions] = await Promise.all([
      this.prisma.feeRecord.aggregate({
        where: this.scopeToSchool(schoolId),
        _sum: {
          totalFee: true,
          amountPaid: true,
        },
      }),
      this.prisma.feeRecord.count({
        where: this.scopeToSchool(schoolId),
      }),
      this.prisma.transaction.findMany({
        where: this.scopeToSchool(schoolId),
        include: {
          feeRecord: {
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { paidAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalCollected = Number(aggregates._sum.amountPaid ?? 0);
    const totalFees = Number(aggregates._sum.totalFee ?? 0);
    const totalOutstanding = totalFees - totalCollected;

    return {
      totalCollected,
      totalOutstanding,
      totalStudentsWithFees: studentCount,
      recentTransactions,
    };
  }

  findFeeRecordByStudentAndTerm(studentId: string, termId: string, schoolId: string) {
    return this.prisma.feeRecord.findFirst({
      where: this.scopeToSchool(schoolId, { studentId, termId }),
      include: {
        transactions: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });
  }
}
