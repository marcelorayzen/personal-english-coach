import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  CorrectionIntensity,
  LearnerProfile,
  PtBrSupportLevel,
} from '@prisma/client';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'config', status: 'ready', phase: 'phase-2' };
  }

  async getPreferences() {
    const profile = await this.getOrCreateDefaultLearnerProfile();
    const preferences = await this.ensurePreferences(profile.id);

    return {
      learnerProfileId: profile.id,
      ptBrSupportLevel: preferences.ptBrSupportLevel,
      correctionIntensity: preferences.correctionIntensity,
      learningGoal: preferences.learningGoal,
      currentFocus: preferences.currentFocus,
      updatedAt: profile.updatedAt,
    };
  }

  async updatePreferences(body: UpdatePreferencesDto) {
    const profile = await this.getOrCreateDefaultLearnerProfile();
    await this.ensurePreferences(profile.id);

    this.validatePreferencesPayload(body);

    const updated = await this.prisma.preferences.update({
      where: { learnerProfileId: profile.id },
      data: {
        ptBrSupportLevel: body.ptBrSupportLevel,
        correctionIntensity: body.correctionIntensity,
        learningGoal:
          body.learningGoal === undefined ? undefined : body.learningGoal,
        currentFocus:
          body.currentFocus === undefined ? undefined : body.currentFocus,
      },
    });

    await this.prisma.learnerProfile.update({
      where: { id: profile.id },
      data: {
        ptBrSupportLevel:
          body.ptBrSupportLevel === undefined
            ? undefined
            : body.ptBrSupportLevel,
        correctionIntensity:
          body.correctionIntensity === undefined
            ? undefined
            : body.correctionIntensity,
        currentFocus:
          body.currentFocus === undefined ? undefined : body.currentFocus,
      },
    });

    return {
      learnerProfileId: profile.id,
      ptBrSupportLevel: updated.ptBrSupportLevel,
      correctionIntensity: updated.correctionIntensity,
      learningGoal: updated.learningGoal,
      currentFocus: updated.currentFocus,
    };
  }

  private validatePreferencesPayload(body: UpdatePreferencesDto) {
    if (
      body.ptBrSupportLevel !== undefined &&
      !Object.values(PtBrSupportLevel).includes(body.ptBrSupportLevel)
    ) {
      throw new BadRequestException('Valor invalido para ptBrSupportLevel');
    }

    if (
      body.correctionIntensity !== undefined &&
      !Object.values(CorrectionIntensity).includes(body.correctionIntensity)
    ) {
      throw new BadRequestException('Valor invalido para correctionIntensity');
    }
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
