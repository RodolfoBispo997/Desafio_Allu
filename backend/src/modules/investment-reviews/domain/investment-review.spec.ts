import {
  InvestmentReview,
  InvestmentReviewDomainError,
  InvestmentReviewStatus,
} from './investment-review';

const input = () => ({
  investmentId: 'investment-id',
  overallExperienceRating: 5,
  informationClarityRating: 4,
  processEaseRating: 3,
  comment: 'This is a valid investment review.',
  policyVersion: '1.0',
  policyAcceptedAt: new Date(),
});

describe('InvestmentReview', () => {
  it('creates a valid pending review', () =>
    expect(InvestmentReview.create(input()).status).toBe(
      InvestmentReviewStatus.PENDING_MODERATION,
    ));
  it.each([0, 6])('rejects invalid ratings', (rating) =>
    expect(() =>
      InvestmentReview.create({ ...input(), overallExperienceRating: rating }),
    ).toThrow(InvestmentReviewDomainError),
  );
  it('rejects a decimal rating', () =>
    expect(() =>
      InvestmentReview.create({ ...input(), overallExperienceRating: 3.5 }),
    ).toThrow(InvestmentReviewDomainError));
  it('rejects a short comment', () =>
    expect(() =>
      InvestmentReview.create({ ...input(), comment: 'short' }),
    ).toThrow(InvestmentReviewDomainError));
  it('approves a pending review', () => {
    const review = InvestmentReview.create(input());
    const moderationDate = new Date('2026-01-01T00:00:00.000Z');
    review.approve(moderationDate);
    expect(review.status).toBe(InvestmentReviewStatus.APPROVED);
    expect(review.updatedAt).toBe(moderationDate);
  });
  it('rejects a pending review with a trimmed reason', () => {
    const review = InvestmentReview.create(input());
    const moderationDate = new Date('2026-01-02T00:00:00.000Z');
    review.reject('  Inappropriate content  ', moderationDate);
    expect(review.moderationReason).toBe('Inappropriate content');
    expect(review.updatedAt).toBe(moderationDate);
  });
  it('does not approve a rejected review', () => {
    const review = InvestmentReview.create(input());
    review.reject('Invalid content');
    expect(() => review.approve()).toThrow(InvestmentReviewDomainError);
  });
  it('does not reject an approved review', () => {
    const review = InvestmentReview.create(input());
    review.approve();
    expect(() => review.reject('Invalid content')).toThrow(
      InvestmentReviewDomainError,
    );
  });
});
