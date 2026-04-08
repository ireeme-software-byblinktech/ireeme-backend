import { Controller, Post, Get, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { FinanceService } from './finance.service';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { SellStockDto } from './dto/sell-stock.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private readonly service: FinanceService) { }

  @Post('payments')
  @Roles(RoleType.ACCOUNTANT)
  @ApiOperation({ summary: 'Record a payment for a student fee' })
  recordPayment(@CurrentUser() user: JwtPayload, @Body() dto: RecordPaymentDto) {
    return this.service.recordPayment(
      dto.studentId,
      dto.termId,
      dto.amount,
      dto.method,
      dto.reference,
      user.schoolId!,
    );
  }

  @Get('students/:id/balance')
  @Roles(RoleType.ACCOUNTANT, RoleType.PARENT)
  @ApiOperation({ summary: 'Get fee balance for a student' })
  getBalance(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) studentId: string,
  ) {
    return this.service.getBalance(studentId, user.schoolId!);
  }

  @Get('transactions')
  @Roles(RoleType.ACCOUNTANT)
  @ApiOperation({ summary: 'Get paginated list of transactions with optional filters' })
  getTransactions(@CurrentUser() user: JwtPayload, @Query() query: QueryTransactionsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return this.service.getTransactions(user.schoolId!, page, limit, {
      studentId: query.studentId,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @Post('stock/sell')
  @Roles(RoleType.ACCOUNTANT)
  @ApiOperation({ summary: 'Sell stock item to a student' })
  sellStock(@CurrentUser() user: JwtPayload, @Body() dto: SellStockDto) {
    return this.service.sellStock(dto.itemId, dto.studentId, dto.qty, user.schoolId!);
  }

  @Get('dashboard')
  @Roles(RoleType.ACCOUNTANT, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get finance dashboard totals' })
  dashboard(@CurrentUser() user: JwtPayload) {
    return this.service.dashboard(user.schoolId!);
  }
}
