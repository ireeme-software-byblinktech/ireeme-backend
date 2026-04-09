import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FinanceRepository } from './finance.repository';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private readonly repo: FinanceRepository) { }

  async recordPayment(
    studentId: string,
    termId: string,
    amount: number,
    method: PaymentMethod,
    reference: string | undefined,
    schoolId: string,
  ) {
    // Find FeeRecord for student+term+schoolId
    const feeRecord = await this.repo.findFeeRecordByStudentAndTerm(studentId, termId, schoolId);
    if (!feeRecord) {
      throw new NotFoundException('Fee record not found');
    }

    // Validate amount > 0
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Validate amount does not exceed outstanding balance
    const outstanding = Number(feeRecord.totalFee) - Number(feeRecord.amountPaid);
    if (amount > outstanding) {
      throw new BadRequestException('Amount exceeds outstanding balance');
    }

    // Create Transaction record
    await this.repo.createTransaction({
      schoolId,
      feeRecordId: feeRecord.id,
      amount,
      method,
      reference,
    });

    // Calculate new amountPaid
    const newAmountPaid = Number(feeRecord.amountPaid) + amount;

    // Determine new status
    let newStatus: PaymentStatus;
    if (newAmountPaid >= Number(feeRecord.totalFee)) {
      newStatus = PaymentStatus.PAID;
    } else if (newAmountPaid > 0) {
      newStatus = PaymentStatus.PARTIAL;
    } else {
      newStatus = PaymentStatus.PENDING;
    }

    // Update FeeRecord with new amountPaid + status
    return this.repo.updateFeeRecord(feeRecord.id, schoolId, {
      amountPaid: newAmountPaid,
      status: newStatus,
    });
  }

  async getBalance(studentId: string, schoolId: string) {
    // Find FeeRecord for student scoped to schoolId
    const feeRecord = await this.repo.getFeeRecord(studentId, schoolId);
    if (!feeRecord) {
      throw new NotFoundException('Fee record not found');
    }

    // Return balance object
    return {
      studentId: feeRecord.studentId,
      totalFee: Number(feeRecord.totalFee),
      amountPaid: Number(feeRecord.amountPaid),
      outstanding: Number(feeRecord.totalFee) - Number(feeRecord.amountPaid),
      status: feeRecord.status,
      transactions: feeRecord.transactions,
    };
  }

  async sellStock(itemId: string, studentId: string, qty: number, schoolId: string) {
    // Find StockItem scoped to schoolId
    const item = await this.repo.findStockItem(itemId, schoolId);
    if (!item) {
      throw new NotFoundException('Stock item not found');
    }

    // Validate qty > 0
    if (qty <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Validate item.quantity >= qty
    if (item.quantity < qty) {
      throw new BadRequestException('Insufficient stock');
    }

    // Decrement StockItem.quantity by qty atomically
    await this.repo.decrementStock(itemId, schoolId, qty);

    // Create StockSale record
    return this.repo.createStockSale({
      schoolId,
      itemId,
      studentId,
      qty,
    });
  }

  async dashboard(schoolId: string) {
    return this.repo.getDashboardTotals(schoolId);
  }

  async getTransactions(
    schoolId: string,
    page: number,
    limit: number,
    filters?: {
      studentId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const parsedFilters: {
      studentId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (filters?.studentId) {
      parsedFilters.studentId = filters.studentId;
    }
    if (filters?.startDate) {
      parsedFilters.startDate = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      parsedFilters.endDate = new Date(filters.endDate);
    }

    return this.repo.getTransactions(schoolId, page, limit, parsedFilters);
  }
}
