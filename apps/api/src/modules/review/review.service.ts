import { Injectable, NotFoundException } from '@nestjs/common';
import { LearnerProfile } from '@prisma/client';
import { ReviewQueuePolicy } from './review-queue.policy';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewQueuePolicy: ReviewQueuePolicy,
    private readonly prisma: PrismaService,
  ) {}

  getStatus() {
    return { module: 'review', status: 'ready', phase: 'phase-3' };
  }

  async getQueue() {
    const profile = await this.getOrCreateDefaultLearnerProfile();
    const items = await this.prisma.reviewQueueItem.findMany({
      where: {
        learnerProfileId: profile.id,
        isCompleted: false,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    return {
      learnerProfileId: profile.id,
      total: items.length,
      items: items.map((item) => ({
        id: item.id,
        itemType: item.itemType,
        prompt: item.prompt,
        priority: item.priority,
        isCompleted: item.isCompleted,
        createdAt: item.createdAt,
      })),
    };
  }

  async completeQueueItem(itemId: string) {
    const existing = await this.prisma.reviewQueueItem.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Item da fila de revisao ${itemId} nao foi encontrado`,
      );
    }

    if (existing.isCompleted) {
      return {
        itemId: existing.id,
        isCompleted: true,
      };
    }

    const updated = await this.prisma.reviewQueueItem.update({
      where: { id: itemId },
      data: { isCompleted: true },
    });

    return {
      itemId: updated.id,
      isCompleted: updated.isCompleted,
    };
  }

  async refreshQueueForLearner(learnerProfileId: string) {
    const recentMistakes = await this.prisma.mistake.findMany({
      where: { learnerProfileId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const decision = this.reviewQueuePolicy.decide(recentMistakes);
    if (!decision) {
      return null;
    }

    const existing = await this.prisma.reviewQueueItem.findFirst({
      where: {
        learnerProfileId,
        itemType: decision.itemType,
        isCompleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      if (decision.priority > existing.priority) {
        await this.prisma.reviewQueueItem.update({
          where: { id: existing.id },
          data: {
            priority: decision.priority,
            prompt: decision.prompt,
          },
        });
      }
      return existing.id;
    }

    const created = await this.prisma.reviewQueueItem.create({
      data: {
        learnerProfileId,
        itemType: decision.itemType,
        prompt: decision.prompt,
        priority: decision.priority,
      },
    });

    return created.id;
  }

  private async getOrCreateDefaultLearnerProfile(): Promise<LearnerProfile> {
    const existingProfile = await this.prisma.learnerProfile.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    if (existingProfile) {
      return existingProfile;
    }

    return this.prisma.learnerProfile.create({
      data: {
        displayName: 'Default Learner',
      },
    });
  }
}
