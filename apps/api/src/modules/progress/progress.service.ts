import { Injectable } from '@nestjs/common';
import { LearnerProfile, UtteranceRole } from '@prisma/client';
import {
  computeCategoryTrends,
  computeSimpleTrend,
} from './progress-trends';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'progress', status: 'ready', phase: 'phase-4' };
  }

  async getSummary() {
    const profile = await this.getOrCreateDefaultLearnerProfile();
    const now = new Date();

    const [sessionCount, learnerUtterances, mistakes, skills, preferences] =
      await Promise.all([
        this.prisma.learningSession.count({
          where: { learnerProfileId: profile.id },
        }),
        this.prisma.utterance.findMany({
          where: {
            role: UtteranceRole.learner,
            session: {
              learnerProfileId: profile.id,
            },
          },
          select: { durationMs: true, createdAt: true },
        }),
        this.prisma.mistake.findMany({
          where: { learnerProfileId: profile.id },
          select: { category: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 200,
        }),
        this.prisma.skillMastery.findMany({
          where: { learnerProfileId: profile.id },
          orderBy: { updatedAt: 'desc' },
          take: 20,
        }),
        this.prisma.preferences.findUnique({
          where: { learnerProfileId: profile.id },
          select: { currentFocus: true, learningGoal: true },
        }),
      ]);

    const spokenMinutes = Number(
      (
        learnerUtterances.reduce((sum, item) => sum + (item.durationMs ?? 0), 0) /
        60000
      ).toFixed(2),
    );

    const recurringIssues = summarizeRecurringIssues(mistakes);
    const recentFocusAreas = buildFocusAreas(preferences?.currentFocus, mistakes);
    const spokenMinutesTrend = computeSimpleTrend(
      learnerUtterances.map((item) => ({
        createdAt: item.createdAt,
        value: (item.durationMs ?? 0) / 60000,
      })),
      { now, windowDays: 7 },
    );
    const sessionsTrend = computeSimpleTrend(
      (
        await this.prisma.learningSession.findMany({
          where: { learnerProfileId: profile.id },
          select: { startedAt: true },
        })
      ).map((session) => ({ createdAt: session.startedAt, value: 1 })),
      { now, windowDays: 7 },
    );
    const recurringIssuesTrend = computeCategoryTrends(mistakes, {
      now,
      windowDays: 7,
    }).slice(0, 5);

    return {
      learnerProfileId: profile.id,
      summary: {
        sessionCount,
        spokenMinutes,
        recurringIssueCount: recurringIssues.length,
        trackedSkillCount: skills.length,
      },
      recurringIssues,
      skillTrends: skills.map((skill) => ({
        skillName: skill.skillName,
        score: skill.score,
        updatedAt: skill.updatedAt,
      })),
      trends: {
        spokenMinutes: spokenMinutesTrend,
        sessions: sessionsTrend,
        recurringIssues: recurringIssuesTrend,
      },
      recentFocusAreas,
      learningGoal: preferences?.learningGoal ?? null,
      generatedAt: new Date().toISOString(),
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
}

function summarizeRecurringIssues(
  mistakes: Array<{ category: string; createdAt: Date }>,
) {
  const byCategory = mistakes.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));
}

function buildFocusAreas(
  currentFocus: string | null | undefined,
  mistakes: Array<{ category: string; createdAt: Date }>,
) {
  const focusAreas: string[] = [];
  if (currentFocus) {
    focusAreas.push(currentFocus);
  }

  for (const issue of summarizeRecurringIssues(mistakes)) {
    if (focusAreas.length >= 5) {
      break;
    }
    if (!focusAreas.includes(issue.category)) {
      focusAreas.push(issue.category);
    }
  }

  return focusAreas;
}
