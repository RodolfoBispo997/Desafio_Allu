import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { InvestmentsModule } from './modules/investments/investments.module';
import { InvestmentReviewsModule } from './modules/investment-reviews/investment-reviews.module';
import { ReviewInvitationsModule } from './modules/review-invitations/review-invitations.module';
import { ApplicationErrorFilter } from './shared/presentation/application-error.filter';
import { DatabaseModule } from './shared/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    InvestmentsModule,
    InvestmentReviewsModule,
    ReviewInvitationsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ApplicationErrorFilter }],
})
export class AppModule {}
