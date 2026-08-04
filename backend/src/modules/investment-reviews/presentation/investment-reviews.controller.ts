import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../../../shared/application/application-error';
import {
  ApproveInvestmentReviewUseCase,
  GetInvestmentReviewUseCase,
  ListPendingInvestmentReviewsUseCase,
  RejectInvestmentReviewUseCase,
} from '../application/moderation.use-cases';
import { RejectInvestmentReviewDto } from './dto/reject-investment-review.dto';

@ApiTags('investment-reviews')
@Controller('investment-reviews')
export class InvestmentReviewsController {
  constructor(
    private readonly listPending: ListPendingInvestmentReviewsUseCase,
    private readonly getReview: GetInvestmentReviewUseCase,
    private readonly approveReview: ApproveInvestmentReviewUseCase,
    private readonly rejectReview: RejectInvestmentReviewUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List pending investment reviews, oldest first' })
  @ApiQuery({ name: 'status', enum: ['PENDING_MODERATION'], required: true })
  async list(@Query('status') status?: string) {
    if (status !== 'PENDING_MODERATION')
      throw new ApplicationError(
        'Only PENDING_MODERATION is supported.',
        ApplicationErrorCode.UNPROCESSABLE,
      );
    return this.listPending.execute();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.getReview.execute(id);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    await this.approveReview.execute(id);
    return { status: 'approved' };
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectInvestmentReviewDto,
  ) {
    await this.rejectReview.execute(id, dto.reason);
    return { status: 'rejected' };
  }
}
