import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetInvestmentReviewInvitationUseCase } from '../application/use-cases/get-investment-review-invitation/get-investment-review-invitation.use-case';
import { SubmitInvestmentReviewUseCase } from '../application/use-cases/submit-investment-review/submit-investment-review.use-case';
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
    return this.getInvitation.execute({ token });
  }
  @Post(':token/review')
  @ApiOperation({
    summary: 'Submit an investment review with optional attachments',
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 3 }], {
      limits: { fileSize: 5 * 1024 * 1024, files: 3 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        overallExperienceRating: { type: 'integer', minimum: 1, maximum: 5 },
        informationClarityRating: { type: 'integer', minimum: 1, maximum: 5 },
        processEaseRating: { type: 'integer', minimum: 1, maximum: 5 },
        comment: { type: 'string', minLength: 10, maxLength: 2000 },
        policyAccepted: { type: 'boolean' },
        attachments: {
          type: 'array',
          maxItems: 3,
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  async submit(
    @Param('token') token: string,
    @Body() dto: SubmitInvestmentReviewDto,
    @UploadedFiles()
    files?: {
      attachments?: Array<{
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      }>;
    },
  ) {
    return this.submitReview.execute({
      token,
      ...dto,
      attachments: files?.attachments?.map((file) => ({
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        buffer: file.buffer,
      })),
    });
  }
}
