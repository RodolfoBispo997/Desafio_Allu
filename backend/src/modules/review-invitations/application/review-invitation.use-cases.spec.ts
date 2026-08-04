import { ApplicationErrorCode } from '../../../shared/application/application-error';
import {
  Investment,
  InvestmentClosureReason,
  InvestmentStatus,
} from '../../investments/domain/investment';
import { InvestmentReviewInvitation } from '../domain/investment-review-invitation';
import { SubmitInvestmentReviewUseCase } from './review-invitation.use-cases';

const input = {
  token: 'token',
  overallExperienceRating: 5,
  informationClarityRating: 4,
  processEaseRating: 3,
  comment: 'This is a valid investment review.',
  policyAccepted: true,
};
const invitation = (
  options?: Partial<{ expiresAt: Date; usedAt: Date | null }>,
) =>
  new InvestmentReviewInvitation({
    id: 'invitation-id',
    investmentId: 'investment-id',
    token: 'token',
    expiresAt: options?.expiresAt ?? new Date('2030-01-01'),
    usedAt: options?.usedAt ?? null,
  });
const investment = (status = InvestmentStatus.CLOSED) =>
  new Investment({
    id: 'investment-id',
    customerName: 'Ana',
    productName: 'Product',
    investedAmount: '10.00',
    startedAt: new Date(),
    closedAt: status === InvestmentStatus.CLOSED ? new Date() : null,
    status,
    closureReason:
      status === InvestmentStatus.CLOSED ? InvestmentClosureReason.OTHER : null,
  });

function createUseCase(overrides?: {
  invitation?: InvestmentReviewInvitation | null;
  investment?: Investment | null;
  existingReview?: object | null;
  submissionError?: Error;
}) {
  const invitations = {
    findByToken: jest
      .fn()
      .mockResolvedValue(
        overrides?.invitation === undefined
          ? invitation()
          : overrides.invitation,
      ),
  };
  const investments = {
    findById: jest
      .fn()
      .mockResolvedValue(
        overrides?.investment === undefined
          ? investment()
          : overrides.investment,
      ),
  };
  const reviews = {
    findByInvestmentId: jest
      .fn()
      .mockResolvedValue(overrides?.existingReview ?? null),
  };
  const submission = {
    submit: jest
      .fn()
      .mockImplementation(() =>
        overrides?.submissionError
          ? Promise.reject(overrides.submissionError)
          : Promise.resolve(undefined),
      ),
  };
  const storage = {
    save: jest
      .fn()
      .mockImplementation((file) =>
        Promise.resolve({ ...file, storageKey: 'stored-file.pdf' }),
      ),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  return {
    useCase: new SubmitInvestmentReviewUseCase(
      invitations,
      investments,
      reviews as never,
      submission,
      storage,
    ),
    submission,
    storage,
  };
}

describe('SubmitInvestmentReviewUseCase', () => {
  it('submits a valid review atomically', async () => {
    const { useCase, submission } = createUseCase();
    const result = await useCase.execute(input);
    expect(result.id).toEqual(expect.any(String));
    expect(submission.submit).toHaveBeenCalledTimes(1);
  });
  it('rejects a missing invitation', async () => {
    const { useCase } = createUseCase({ invitation: null });
    await expect(useCase.execute(input)).rejects.toEqual(
      expect.objectContaining({
        code: ApplicationErrorCode.NOT_FOUND,
      }),
    );
  });
  it('rejects an expired invitation', async () => {
    const { useCase } = createUseCase({
      invitation: invitation({ expiresAt: new Date('2020-01-01') }),
    });
    await expect(useCase.execute(input)).rejects.toEqual(
      expect.objectContaining({
        code: ApplicationErrorCode.GONE,
      }),
    );
  });
  it('rejects a used invitation', async () => {
    const { useCase } = createUseCase({
      invitation: invitation({ usedAt: new Date() }),
    });
    await expect(useCase.execute(input)).rejects.toEqual(
      expect.objectContaining({
        code: ApplicationErrorCode.CONFLICT,
      }),
    );
  });
  it('rejects an active investment', async () => {
    const { useCase } = createUseCase({
      investment: investment(InvestmentStatus.ACTIVE),
    });
    await expect(useCase.execute(input)).rejects.toEqual(
      expect.objectContaining({
        code: ApplicationErrorCode.UNPROCESSABLE,
      }),
    );
  });
  it('rejects a duplicate review', async () => {
    const { useCase } = createUseCase({ existingReview: {} });
    await expect(useCase.execute(input)).rejects.toEqual(
      expect.objectContaining({
        code: ApplicationErrorCode.CONFLICT,
      }),
    );
  });
  it('requires policy acceptance', async () => {
    const { useCase } = createUseCase();
    await expect(
      useCase.execute({ ...input, policyAccepted: false }),
    ).rejects.toEqual(
      expect.objectContaining({
        code: ApplicationErrorCode.UNPROCESSABLE,
      }),
    );
  });
  it('accepts attachment metadata', async () => {
    const { useCase, submission } = createUseCase();
    await useCase.execute({
      ...input,
      attachments: [
        {
          originalFileName: 'receipt.pdf',
          mimeType: 'application/pdf',
          fileSize: 20,
          buffer: Buffer.from('pdf'),
        },
      ],
    });
    expect(submission.submit).toHaveBeenCalledWith(
      expect.anything(),
      'invitation-id',
      expect.any(Date),
      [expect.objectContaining({ storageKey: 'stored-file.pdf' })],
    );
  });
  it.each([
    [
      [
        {
          originalFileName: 'a.pdf',
          mimeType: 'application/pdf',
          fileSize: 1,
          buffer: Buffer.alloc(1),
        },
        {
          originalFileName: 'b.pdf',
          mimeType: 'application/pdf',
          fileSize: 1,
          buffer: Buffer.alloc(1),
        },
        {
          originalFileName: 'c.pdf',
          mimeType: 'application/pdf',
          fileSize: 1,
          buffer: Buffer.alloc(1),
        },
        {
          originalFileName: 'd.pdf',
          mimeType: 'application/pdf',
          fileSize: 1,
          buffer: Buffer.alloc(1),
        },
      ],
    ],
    [
      [
        {
          originalFileName: 'a.txt',
          mimeType: 'text/plain',
          fileSize: 1,
          buffer: Buffer.alloc(1),
        },
      ],
    ],
    [
      [
        {
          originalFileName: 'a.pdf',
          mimeType: 'application/pdf',
          fileSize: 5 * 1024 * 1024 + 1,
          buffer: Buffer.alloc(1),
        },
      ],
    ],
  ])('rejects invalid attachments', async (attachments) => {
    const { useCase, storage } = createUseCase();
    await expect(useCase.execute({ ...input, attachments })).rejects.toEqual(
      expect.objectContaining({ code: ApplicationErrorCode.UNPROCESSABLE }),
    );
    expect(storage.save).not.toHaveBeenCalled();
  });
  it('removes stored files when persistence fails', async () => {
    const { useCase, storage } = createUseCase({
      submissionError: new Error('database failed'),
    });
    await expect(
      useCase.execute({
        ...input,
        attachments: [
          {
            originalFileName: 'receipt.pdf',
            mimeType: 'application/pdf',
            fileSize: 20,
            buffer: Buffer.from('pdf'),
          },
        ],
      }),
    ).rejects.toThrow('database failed');
    expect(storage.delete).toHaveBeenCalledWith('stored-file.pdf');
  });
});
