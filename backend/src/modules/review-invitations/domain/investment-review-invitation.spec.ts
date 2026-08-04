import { InvestmentReviewInvitation } from './investment-review-invitation';

const createInvitation = (expiresAt: Date, usedAt: Date | null = null) =>
  new InvestmentReviewInvitation({
    id: 'invitation-id',
    investmentId: 'investment-id',
    token: 'token',
    expiresAt,
    usedAt,
  });

describe('InvestmentReviewInvitation', () => {
  it('is available when unused and unexpired', () =>
    expect(
      createInvitation(new Date('2030-01-01')).isAvailable(
        new Date('2029-01-01'),
      ),
    ).toBe(true));
  it('is unavailable when expired', () =>
    expect(
      createInvitation(new Date('2020-01-01')).isAvailable(
        new Date('2021-01-01'),
      ),
    ).toBe(false));
  it('is unavailable when used', () =>
    expect(
      createInvitation(new Date('2030-01-01'), new Date()).isAvailable(),
    ).toBe(false));
});
