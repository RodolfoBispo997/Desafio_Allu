/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { InvestmentReview } from '../domain/investment-review';
import { InvestmentReviewPrismaRepository } from './investment-review-prisma.repository';

describe('InvestmentReviewPrismaRepository', () => {
  it('creates attachment records with the review in the transaction', async () => {
    const create = jest.fn().mockResolvedValue(undefined);
    const update = jest.fn().mockResolvedValue(undefined);
    const prisma = {
      $transaction: jest.fn().mockImplementation((callback) =>
        callback({
          investmentReview: { create },
          investmentReviewInvitation: { update },
        }),
      ),
    };
    const repository = new InvestmentReviewPrismaRepository(prisma as never);
    const review = InvestmentReview.create({
      investmentId: 'investment-id',
      overallExperienceRating: 5,
      informationClarityRating: 4,
      processEaseRating: 4,
      comment: 'This review contains a valid comment.',
      policyVersion: '1.0',
      policyAcceptedAt: new Date(),
    });
    const attachments = [
      {
        storageKey: 'file.pdf',
        originalFileName: 'receipt.pdf',
        mimeType: 'application/pdf',
        fileSize: 10,
      },
    ];

    await repository.submit(review, 'invitation-id', new Date(), attachments);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ attachments: { create: attachments } }),
      }),
    );
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'invitation-id' } }),
    );
  });
});
