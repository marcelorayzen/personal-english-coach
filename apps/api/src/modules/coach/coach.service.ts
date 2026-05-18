import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LearnerProfile,
  MistakeCategory,
  SessionType,
  UtteranceRole,
} from '@prisma/client';
import { LearnerStateDerivationService } from '../learner-memory/learner-state-derivation.service';
import { CreateCoachSessionDto } from './dto/create-coach-session.dto';
import { CreateCoachTurnDto } from './dto/create-coach-turn.dto';
import {
  CoachGenerationPort,
  CoachGenerationResult,
} from './ports/coach-generation.port';
import { ReviewService } from '../review/review.service';
import { applyCorrectionCap } from './pedagogy/correction-cap';
import {
  COACH_GENERATION_PORT,
  SYNTHESIS_PORT,
  TRANSCRIPTION_PORT,
} from './ports/tokens';
import { SynthesisPort } from './ports/synthesis.port';
import { TranscriptionPort } from './ports/transcription.port';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class CoachService {
  constructor(
    @Inject(TRANSCRIPTION_PORT)
    private readonly transcriptionPort: TranscriptionPort,
    @Inject(SYNTHESIS_PORT)
    private readonly synthesisPort: SynthesisPort,
    @Inject(COACH_GENERATION_PORT)
    private readonly coachGenerationPort: CoachGenerationPort,
    private readonly learnerStateDerivationService: LearnerStateDerivationService,
    private readonly reviewService: ReviewService,
    private readonly prisma: PrismaService,
  ) {}

  getStatus() {
    return { module: 'coach', status: 'ready', phase: 'phase-1' };
  }

  async createSession(body: CreateCoachSessionDto) {
    const learnerProfile = await this.getOrCreateDefaultLearnerProfile();
    const title = body?.title?.trim();

    const session = await this.prisma.learningSession.create({
      data: {
        learnerProfileId: learnerProfile.id,
        sessionType: SessionType.conversation,
        title: title || null,
      },
    });

    return {
      sessionId: session.id,
      learnerProfileId: session.learnerProfileId,
      sessionType: session.sessionType,
      title: session.title,
      startedAt: session.startedAt,
    };
  }

  async createTurn(sessionId: string, body: CreateCoachTurnDto) {
    const normalizedSessionId = sessionId?.trim();
    if (!normalizedSessionId) {
      throw new BadRequestException('sessionId e obrigatorio');
    }

    const learnerText = body?.learnerText?.trim();
    if (!learnerText) {
      throw new BadRequestException('learnerText e obrigatorio');
    }

    const session = await this.prisma.learningSession.findUnique({
      where: { id: normalizedSessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Sessao ${normalizedSessionId} nao foi encontrada`,
      );
    }

    const transcription = await this.transcriptionPort.transcribe({
      sessionId: normalizedSessionId,
      learnerText,
      languageCode: body.languageCode,
      durationMs: body.durationMs,
    });

    const recentUtterances = await this.prisma.utterance.findMany({
      where: { learningSessionId: normalizedSessionId },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    const [preferences, learnerProfile] = await Promise.all([
      this.prisma.preferences.findUnique({
        where: { learnerProfileId: session.learnerProfileId },
      }),
      this.prisma.learnerProfile.findUnique({
        where: { id: session.learnerProfileId },
      }),
    ]);

    const generation = await this.coachGenerationPort.generate({
      sessionId: normalizedSessionId,
      learnerText: transcription.transcript,
      recentContext: recentUtterances.map((utterance) => utterance.transcript),
      correctionIntensity: preferences?.correctionIntensity,
      ptBrSupportLevel: preferences?.ptBrSupportLevel,
      currentFocus: preferences?.currentFocus ?? learnerProfile?.currentFocus ?? null,
      learningGoal: preferences?.learningGoal ?? null,
      preferredInteractionStyle: learnerProfile?.preferredInteractionStyle ?? null,
    });

    const boundedGeneration = this.limitCorrections(generation);
    const synthesis = await this.synthesisPort.synthesize({
      sessionId: normalizedSessionId,
      text: boundedGeneration.coachText,
    });

    const learnerUtterance = await this.prisma.utterance.create({
      data: {
        learningSessionId: normalizedSessionId,
        role: UtteranceRole.learner,
        transcript: transcription.transcript,
        languageCode: transcription.languageCode ?? null,
        provider: transcription.provider,
        durationMs: transcription.durationMs ?? null,
        transcriptionConfidence: transcription.confidence ?? null,
      },
    });

    const coachUtterance = await this.prisma.utterance.create({
      data: {
        learningSessionId: normalizedSessionId,
        role: UtteranceRole.coach,
        transcript: boundedGeneration.coachText,
        languageCode: transcription.languageCode ?? null,
        provider: boundedGeneration.provider,
      },
    });

    const systemSummary = this.buildSystemSummary(boundedGeneration);
    const systemUtterance = await this.prisma.utterance.create({
      data: {
        learningSessionId: normalizedSessionId,
        role: UtteranceRole.system,
        transcript: systemSummary,
        provider: 'coach-orchestrator',
      },
    });

    await this.updateLearnerMemoryFromTurn(
      session.learnerProfileId,
      transcription.transcript,
      boundedGeneration,
    );

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
      systemUtterance: {
        id: systemUtterance.id,
        role: systemUtterance.role,
        transcript: systemUtterance.transcript,
        createdAt: systemUtterance.createdAt,
      },
      corrections: boundedGeneration.corrections,
      synthesis,
    };
  }

  async getSession(sessionId: string) {
    const normalizedSessionId = sessionId?.trim();
    if (!normalizedSessionId) {
      throw new BadRequestException('sessionId e obrigatorio');
    }

    const session = await this.prisma.learningSession.findUnique({
      where: { id: normalizedSessionId },
      include: {
        utterances: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(
        `Sessao ${normalizedSessionId} nao foi encontrada`,
      );
    }

    return {
      sessionId: session.id,
      learnerProfileId: session.learnerProfileId,
      sessionType: session.sessionType,
      title: session.title,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      utterances: session.utterances.map((utterance) => ({
        id: utterance.id,
        role: utterance.role,
        transcript: utterance.transcript,
        languageCode: utterance.languageCode,
        provider: utterance.provider,
        durationMs: utterance.durationMs,
        transcriptionConfidence: utterance.transcriptionConfidence,
        createdAt: utterance.createdAt,
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
      data: {
        displayName: 'Default Learner',
      },
    });
  }

  private limitCorrections(
    generation: CoachGenerationResult,
  ): CoachGenerationResult {
    return applyCorrectionCap(generation, 2);
  }

  private buildSystemSummary(generation: CoachGenerationResult): string {
    const correctionSummary =
      generation.corrections.length === 0
        ? 'No corrections for this turn.'
        : generation.corrections
            .map((correction, index) => `${index + 1}. ${correction.issue}`)
            .join(' ');

    return `${generation.systemNotes ?? 'Turn processed.'} ${correctionSummary}`;
  }

  private async updateLearnerMemoryFromTurn(
    learnerProfileId: string,
    learnerTranscript: string,
    generation: CoachGenerationResult,
  ) {
    for (const correction of generation.corrections) {
      await this.prisma.mistake.create({
        data: {
          learnerProfileId,
          category: this.inferMistakeCategory(correction.issue),
          sourceText: learnerTranscript,
          correctedText: correction.guidance,
          explanation: correction.issue,
        },
      });
    }

    const skillName = 'conversation-accuracy';
    const existingSkill = await this.prisma.skillMastery.findFirst({
      where: {
        learnerProfileId,
        skillName,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const penalty = generation.corrections.length * 0.05;
    const nextScore = Number(
      Math.max(0.1, (existingSkill?.score ?? 0.8) - penalty).toFixed(2),
    );

    if (existingSkill) {
      await this.prisma.skillMastery.update({
        where: { id: existingSkill.id },
        data: { score: nextScore },
      });
    } else {
      await this.prisma.skillMastery.create({
        data: {
          learnerProfileId,
          skillName,
          score: nextScore,
        },
      });
    }

    const [sessionCount, utteranceCount, mistakes, skills] = await Promise.all([
      this.prisma.learningSession.count({
        where: { learnerProfileId },
      }),
      this.prisma.utterance.count({
        where: {
          session: {
            learnerProfileId,
          },
        },
      }),
      this.prisma.mistake.findMany({
        where: { learnerProfileId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.skillMastery.findMany({
        where: { learnerProfileId },
      }),
    ]);

    const state = this.learnerStateDerivationService.derive({
      sessionCount,
      utteranceCount,
      mistakes,
      skills,
    });

    await this.prisma.learnerSnapshot.create({
      data: {
        learnerProfileId,
        summary: this.learnerStateDerivationService.buildSnapshotSummary(state),
      },
    });

    await this.reviewService.refreshQueueForLearner(learnerProfileId);
  }

  private inferMistakeCategory(issue: string): MistakeCategory {
    const normalizedIssue = issue.toLowerCase();

    if (normalizedIssue.includes('pronunciation')) {
      return MistakeCategory.pronunciation;
    }

    if (normalizedIssue.includes('vocabulary')) {
      return MistakeCategory.vocabulary;
    }

    if (normalizedIssue.includes('fluency')) {
      return MistakeCategory.fluency;
    }

    if (normalizedIssue.includes('word choice')) {
      return MistakeCategory.word_choice;
    }

    if (normalizedIssue.includes('syntax')) {
      return MistakeCategory.syntax;
    }

    return MistakeCategory.grammar;
  }
}
