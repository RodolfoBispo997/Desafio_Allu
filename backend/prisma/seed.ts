import {
  InvestmentClosureReason,
  InvestmentReviewStatus,
  InvestmentStatus,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

const investmentIds = {
  validInvitation: '10000000-0000-4000-8000-000000000001',
  expiredInvitation: '10000000-0000-4000-8000-000000000002',
  usedInvitation: '10000000-0000-4000-8000-000000000003',
  activeInvestment: '10000000-0000-4000-8000-000000000004',
};

const invitationTokens = [
  'valid-review-invitation',
  'expired-review-invitation',
  'used-review-invitation',
  'active-investment-invitation',
];

async function upsertInvestment(
  id: string,
  data: Parameters<typeof prisma.investment.upsert>[0]['create'],
): Promise<void> {
  await prisma.investment.upsert({ where: { id }, create: data, update: data });
}

async function main(): Promise<void> {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  await upsertInvestment(investmentIds.validInvitation, {
    id: investmentIds.validInvitation,
    customerName: 'Ana Souza',
    productName: 'Allu Renda Fixa 2026',
    investedAmount: '10000.00',
    startedAt: new Date('2024-01-15T12:00:00.000Z'),
    closedAt: new Date('2026-07-15T12:00:00.000Z'),
    status: InvestmentStatus.CLOSED,
    closureReason: InvestmentClosureReason.REACHED_MATURITY,
  });

  await upsertInvestment(investmentIds.expiredInvitation, {
    id: investmentIds.expiredInvitation,
    customerName: 'Bruno Lima',
    productName: 'Allu Crédito Privado 2025',
    investedAmount: '7500.00',
    startedAt: new Date('2023-06-10T12:00:00.000Z'),
    closedAt: new Date('2026-06-30T12:00:00.000Z'),
    status: InvestmentStatus.CLOSED,
    closureReason: InvestmentClosureReason.OTHER,
  });

  await upsertInvestment(investmentIds.usedInvitation, {
    id: investmentIds.usedInvitation,
    customerName: 'Carla Mendes',
    productName: 'Allu Liquidez Planejada',
    investedAmount: '15000.00',
    startedAt: new Date('2024-03-20T12:00:00.000Z'),
    closedAt: new Date('2026-07-01T12:00:00.000Z'),
    status: InvestmentStatus.CLOSED,
    closureReason: InvestmentClosureReason.REDEEMED_EARLY,
  });

  await upsertInvestment(investmentIds.activeInvestment, {
    id: investmentIds.activeInvestment,
    customerName: 'Diego Alves',
    productName: 'Allu Renda Fixa 2027',
    investedAmount: '5000.00',
    startedAt: new Date('2025-01-10T12:00:00.000Z'),
    closedAt: null,
    status: InvestmentStatus.ACTIVE,
    closureReason: null,
  });

  await prisma.investmentReviewInvitation.upsert({
    where: { token: invitationTokens[0] },
    create: { investmentId: investmentIds.validInvitation, token: invitationTokens[0], expiresAt: futureDate },
    update: { investmentId: investmentIds.validInvitation, expiresAt: futureDate, usedAt: null },
  });
  await prisma.investmentReviewInvitation.upsert({
    where: { token: invitationTokens[1] },
    create: { investmentId: investmentIds.expiredInvitation, token: invitationTokens[1], expiresAt: pastDate },
    update: { investmentId: investmentIds.expiredInvitation, expiresAt: pastDate, usedAt: null },
  });
  await prisma.investmentReviewInvitation.upsert({
    where: { token: invitationTokens[2] },
    create: { investmentId: investmentIds.usedInvitation, token: invitationTokens[2], expiresAt: futureDate, usedAt: now },
    update: { investmentId: investmentIds.usedInvitation, expiresAt: futureDate, usedAt: now },
  });
  await prisma.investmentReviewInvitation.upsert({
    where: { token: invitationTokens[3] },
    create: { investmentId: investmentIds.activeInvestment, token: invitationTokens[3], expiresAt: futureDate },
    update: { investmentId: investmentIds.activeInvestment, expiresAt: futureDate, usedAt: null },
  });

  await prisma.investmentReview.upsert({
    where: { investmentId: investmentIds.usedInvitation },
    create: {
      investmentId: investmentIds.usedInvitation,
      overallExperienceRating: 5,
      informationClarityRating: 4,
      processEaseRating: 4,
      comment: 'O processo de resgate foi claro e fácil de concluir.',
      policyVersion: '1.0',
      policyAcceptedAt: now,
      status: InvestmentReviewStatus.PENDING_MODERATION,
    },
    update: {
      overallExperienceRating: 5,
      informationClarityRating: 4,
      processEaseRating: 4,
      comment: 'O processo de resgate foi claro e fácil de concluir.',
      policyVersion: '1.0',
      policyAcceptedAt: now,
      status: InvestmentReviewStatus.PENDING_MODERATION,
      moderatedAt: null,
      moderationReason: null,
    },
  });

  console.log(`Seed completed. Invitation tokens: ${invitationTokens.join(', ')}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
