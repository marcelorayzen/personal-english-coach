import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LearnerProfile,
  MistakeCategory,
  SessionType,
  UtteranceRole,
} from '@prisma/client';
import { ReviewService } from '../review/review.service';
import { CreateReadingAttemptDto } from './dto/create-reading-attempt.dto';
import { CreateReadingSessionDto } from './dto/create-reading-session.dto';
import { assessReadingAttempt } from './reading-assessment';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class ReadingService {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly prisma: PrismaService,
  ) {}

  getStatus() {
    return { module: 'reading', status: 'ready', phase: 'phase-4' };
  }

  async createSession(body: CreateReadingSessionDto) {
    const learnerProfile = await this.getOrCreateDefaultLearnerProfile();
    const title = body.title?.trim() || 'Pratica de Leitura';

    const session = await this.prisma.learningSession.create({
      data: {
        learnerProfileId: learnerProfile.id,
        sessionType: SessionType.reading,
        title,
      },
    });

    await this.prisma.utterance.create({
      data: {
        learningSessionId: session.id,
        role: UtteranceRole.system,
        transcript: `TEXTO_ALVO: ${body.targetText}`,
        languageCode: body.languageCode ?? null,
        provider: 'reading-session',
      },
    });

    return {
      sessionId: session.id,
      learnerProfileId: session.learnerProfileId,
      sessionType: session.sessionType,
      title: session.title,
      targetText: body.targetText,
      startedAt: session.startedAt,
    };
  }

  async createAttempt(sessionId: string, body: CreateReadingAttemptDto) {
    const normalizedSessionId = sessionId?.trim();
    if (!normalizedSessionId) {
      throw new BadRequestException('sessionId e obrigatorio');
    }

    const session = await this.prisma.learningSession.findUnique({
      where: { id: normalizedSessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Sessao ${normalizedSessionId} nao foi encontrada`,
      );
    }

    if (session.sessionType !== SessionType.reading) {
      throw new BadRequestException(
        `Sessao ${normalizedSessionId} nao e uma sessao de leitura`,
      );
    }

    const targetUtterance = await this.prisma.utterance.findFirst({
      where: {
        learningSessionId: normalizedSessionId,
        role: UtteranceRole.system,
        transcript: {
          startsWith: 'TEXTO_ALVO: ',
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!targetUtterance) {
      throw new BadRequestException(
        `Sessao ${normalizedSessionId} nao possui texto alvo`,
      );
    }

    const targetText = targetUtterance.transcript.replace(/^TEXTO_ALVO:\s*/, '');
    const assessment = assessReadingAttempt(targetText, body.attemptText);

    const learnerUtterance = await this.prisma.utterance.create({
      data: {
        learningSessionId: normalizedSessionId,
        role: UtteranceRole.learner,
        transcript: body.attemptText,
        languageCode: body.languageCode ?? null,
        durationMs: body.durationMs ?? null,
        provider: 'reading-attempt',
      },
    });

    const coachUtterance = await this.prisma.utterance.create({
      data: {
        learningSessionId: normalizedSessionId,
        role: UtteranceRole.coach,
        transcript: assessment.feedback,
        languageCode: body.languageCode ?? null,
        provider: 'reading-feedback-v1',
      },
    });

    await this.prisma.utterance.create({
      data: {
        learningSessionId: normalizedSessionId,
        role: UtteranceRole.system,
        transcript: this.buildAssessmentSummary(assessment),
        provider: 'reading-assessment',
      },
    });

    if (assessment.accuracyPercent < 85) {
      await this.prisma.mistake.create({
        data: {
          learnerProfileId: session.learnerProfileId,
          category: MistakeCategory.reading_accuracy,
          sourceText: body.attemptText,
          correctedText: targetText,
          explanation: `Acuracia de leitura abaixo do limiar (${assessment.accuracyPercent}%)`,
        },
      });
      await this.reviewService.refreshQueueForLearner(session.learnerProfileId);
    }

    return {
      sessionId: normalizedSessionId,
      learnerUtterance: {
        id: learnerUtterance.id,
        role: learnerUtterance.role,
        transcript: learnerUtterance.transcript,
        createdAt: learnerUtterance.createdAt,
      },
      coachUtterance: {
        id: coachUtterance.id,
        role: coachUtterance.role,
        transcript: coachUtterance.transcript,
        createdAt: coachUtterance.createdAt,
      },
      assessment,
    };
  }

  private buildAssessmentSummary(assessment: ReturnType<typeof assessReadingAttempt>) {
    return `AVALIACAO_LEITURA: acuracia=${assessment.accuracyPercent}; cobertura=${assessment.coveragePercent}; faltando=${assessment.missingWords.join(',') || 'nenhum'}; extras=${assessment.extraWords.join(',') || 'nenhum'}`;
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
