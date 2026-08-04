import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetInvestmentReviewInvitationUseCase,
  SubmitInvestmentReviewUseCase,
} from '../application/review-invitation.use-cases';
import { SubmitInvestmentReviewDto } from './dto/submit-investment-review.dto';

@ApiTags('review-invitations')
@Controller('review-invitations')
export class ReviewInvitationsController {
  constructor(
    private readonly getInvitation: GetInvestmentReviewInvitationUseCase,
    private readonly submitReview: SubmitInvestmentReviewUseCase,
  ) {}
  @Get(':token')
  @ApiOperation({ summary: 'Get a review invitation and its investment' })
  async get(@Param('token') token: string) {
    return this.getInvitation.execute(token);
  }
  @Post(':token/review')
  @ApiOperation({ summary: 'Submit an investment review' })
  async submit(
    @Param('token') token: string,
    @Body() dto: SubmitInvestmentReviewDto,
  ) {
    return this.submitReview.execute({ token, ...dto });
  }
}
