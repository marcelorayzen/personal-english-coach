import { Injectable } from '@nestjs/common';
import { LearnerProfile } from '@prisma/client';
import { LearnerStateDerivationService } from './learner-state-derivation.service';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class LearnerMemoryService {
  constructor(
    private readonly learnerStateDerivationService: LearnerStateDerivationService,
    private readonly prisma: PrismaService,
  ) {}

  getStatus() {
    return { module: 'learner-memory', status: 'ready', phase: 'phase-2' };
  }

  async getProfile() {
    const profile = await this.getOrCreateDefaultLearnerProfile();
    const preferences = await this.ensurePreferences(profile.id);

    return {
      learnerProfileId: profile.id,
      displayName: profile.displayName,
      levelEstimate: profile.levelEstimate,
      speakingConfidence: profile.speakingConfidence,
      readingConfidence: profile.readingConfidence,
      ptBrSupportLevel: preferences.ptBrSupportLevel,
      correctionIntensity: preferences.correctionIntensity,
      currentFocus: preferences.currentFocus ?? profile.currentFocus,
      learningGoal: preferences.learningGoal,
      preferredInteractionStyle: profile.preferredInteractionStyle,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async getState() {
    const profile = await this.getOrCreateDefaultLearnerProfile();

    const [sessionCount, utteranceCount, mistakes, skills, snapshots] =
      await Promise.all([
        this.prisma.learningSession.count({
          where: { learnerProfileId: profile.id },
        }),
        this.prisma.utterance.count({
          where: {
            session: {
              learnerProfileId: profile.id,
            },
          },
        }),
        this.prisma.mistake.findMany({
          where: { learnerProfileId: profile.id },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        this.prisma.skillMastery.findMany({
          where: { learnerProfileId: profile.id },
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.learnerSnapshot.findMany({
          where: { learnerProfileId: profile.id },
          orderBy: { createdAt: 'desc' },
          take: 1,
        }),
      ]);

    const state = this.learnerStateDerivationService.derive({
      utteranceCount,
      sessionCount,
      mistakes,
      skills,
    });

    return {
      learnerProfileId: profile.id,
      ...state,
      latestSnapshot: snapshots[0]
        ? {
            id: snapshots[0].id,
            summary: snapshots[0].summary,
            createdAt: snapshots[0].createdAt,
          }
        : null,
    };
  }

  async getSnapshots() {
    const profile = await this.getOrCreateDefaultLearnerProfile();
    const snapshots = await this.prisma.learnerSnapshot.findMany({
      where: { learnerProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      learnerProfileId: profile.id,
      total: snapshots.length,
      items: snapshots.map((snapshot) => ({
        id: snapshot.id,
        summary: snapshot.summary,
        createdAt: snapshot.createdAt,
      })),
    };
  }

  private async getOrCreateDefaultLearnerProfile(): Promise<LearnerProfile> {
    const existingProfile = await this.prisma.learnerProfile.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (existingProfile) {
      return existingProfile;
    }

    return this.prisma.learnerProfile.create({
      data: { displayName: 'Default Learner' },
    });
  }

  private async ensurePreferences(learnerProfileId: string) {
    const existingPreferences = await this.prisma.preferences.findUnique({
      where: { learnerProfileId },
    });

    if (existingPreferences) {
      return existingPreferences;
    }

    return this.prisma.preferences.create({
      data: { learnerProfileId },
    });
  }
}
