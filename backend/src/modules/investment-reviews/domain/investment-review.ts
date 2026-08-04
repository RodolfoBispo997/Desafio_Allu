import { randomUUID } from 'crypto';

export enum InvestmentReviewStatus {
  PENDING_MODERATION = 'PENDING_MODERATION',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class InvestmentReviewDomainError extends Error {}

export interface CreateInvestmentReviewProperties {
  investmentId: string;
  overallExperienceRating: number;
  informationClarityRating: number;
  processEaseRating: number;
  comment: string;
  policyVersion: string;
  policyAcceptedAt: Date;
}

export interface InvestmentReviewProperties extends CreateInvestmentReviewProperties {
  id: string;
  status: InvestmentReviewStatus;
  moderatedAt: Date | null;
  moderationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class InvestmentReview {
  private constructor(
    private readonly properties: InvestmentReviewProperties,
  ) {}

  static create(input: CreateInvestmentReviewProperties): InvestmentReview {
    const comment = input.comment.trim();
    if (
      [
        input.overallExperienceRating,
        input.informationClarityRating,
        input.processEaseRating,
      ].some((rating) => !Number.isInteger(rating) || rating < 1 || rating > 5)
    ) {
      throw new InvestmentReviewDomainError('Ratings must be between 1 and 5.');
    }
    if (comment.length < 10 || comment.length > 2000) {
      throw new InvestmentReviewDomainError(
        'Comment must contain between 10 and 2000 characters.',
      );
    }
    if (!input.policyVersion.trim()) {
      throw new InvestmentReviewDomainError('Policy version is required.');
    }
    if (!input.policyAcceptedAt) {
      throw new InvestmentReviewDomainError(
        'Policy acceptance date is required.',
      );
    }
    const now = new Date();
    return new InvestmentReview({
      ...input,
      comment,
      id: randomUUID(),
      status: InvestmentReviewStatus.PENDING_MODERATION,
      moderatedAt: null,
      moderationReason: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(properties: InvestmentReviewProperties): InvestmentReview {
    return new InvestmentReview(properties);
  }

  get id(): string {
    return this.properties.id;
  }
  get investmentId(): string {
    return this.properties.investmentId;
  }
  get overallExperienceRating(): number {
    return this.properties.overallExperienceRating;
  }
  get informationClarityRating(): number {
    return this.properties.informationClarityRating;
  }
  get processEaseRating(): number {
    return this.properties.processEaseRating;
  }
  get comment(): string {
    return this.properties.comment;
  }
  get policyVersion(): string {
    return this.properties.policyVersion;
  }
  get policyAcceptedAt(): Date {
    return this.properties.policyAcceptedAt;
  }
  get status(): InvestmentReviewStatus {
    return this.properties.status;
  }
  get moderatedAt(): Date | null {
    return this.properties.moderatedAt;
  }
  get moderationReason(): string | null {
    return this.properties.moderationReason;
  }
  get createdAt(): Date {
    return this.properties.createdAt;
  }
  get updatedAt(): Date {
    return this.properties.updatedAt;
  }

  approve(date = new Date()): void {
    this.ensurePending();
    this.properties.status = InvestmentReviewStatus.APPROVED;
    this.properties.moderatedAt = date;
    this.properties.updatedAt = date;
    this.properties.moderationReason = null;
  }

  reject(reason: string, date = new Date()): void {
    this.ensurePending();
    const moderationReason = reason.trim();
    if (!moderationReason)
      throw new InvestmentReviewDomainError('Moderation reason is required.');
    this.properties.status = InvestmentReviewStatus.REJECTED;
    this.properties.moderatedAt = date;
    this.properties.updatedAt = date;
    this.properties.moderationReason = moderationReason;
  }

  private ensurePending(): void {
    if (this.properties.status !== InvestmentReviewStatus.PENDING_MODERATION) {
      throw new InvestmentReviewDomainError(
        'Only pending reviews can be moderated.',
      );
    }
  }
}
