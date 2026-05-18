import {
  CorrectionIntensity,
  PrismaClient,
  PtBrSupportLevel,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingProfile = await prisma.learnerProfile.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (existingProfile) {
    await prisma.preferences.upsert({
      where: { learnerProfileId: existingProfile.id },
      update: {},
      create: {
        learnerProfileId: existingProfile.id,
        ptBrSupportLevel: PtBrSupportLevel.medium,
        correctionIntensity: CorrectionIntensity.balanced,
        learningGoal: 'Improve speaking consistency',
        currentFocus: 'Present simple and past simple',
      },
    });
    return;
  }

  const profile = await prisma.learnerProfile.create({
    data: {
      displayName: 'Default Learner',
      levelEstimate: 'A2',
      speakingConfidence: 0.4,
      readingConfidence: 0.45,
      currentFocus: 'Present simple and past simple',
    },
  });

  await prisma.preferences.create({
    data: {
      learnerProfileId: profile.id,
      ptBrSupportLevel: PtBrSupportLevel.medium,
      correctionIntensity: CorrectionIntensity.balanced,
      learningGoal: 'Improve speaking consistency',
      currentFocus: 'Present simple and past simple',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
