import { Injectable } from '@nestjs/common';
import {
  CoachCorrection,
  CoachGenerationPort,
  CoachGenerationRequest,
  CoachGenerationResult,
} from '../ports/coach-generation.port';

@Injectable()
export class MockCoachGenerationAdapter implements CoachGenerationPort {
  async generate(input: CoachGenerationRequest): Promise<CoachGenerationResult> {
    const corrections = this.detectCorrections(input.learnerText).slice(0, 2);
    const coachText = this.buildCoachResponse(input, corrections);

    return {
      provider: 'mock-coach-generation',
      coachText,
      corrections,
      systemNotes: `Applied ${corrections.length} correction focus point(s).`,
    };
  }

  private detectCorrections(text: string): CoachCorrection[] {
    const lowerText = text.toLowerCase();
    const corrections: CoachCorrection[] = [];

    if (lowerText.includes('i has ')) {
      corrections.push({
        issue: "Use 'have' com 'I'.",
        guidance: "Diga 'I have ...' em vez de 'I has ...'.",
      });
    }

    if (lowerText.includes('he go ') || lowerText.endsWith('he go')) {
      corrections.push({
        issue: "Use '-s' na terceira pessoa do singular no present simple.",
        guidance: "Diga 'he goes ...' em vez de 'he go ...'.",
      });
    }

    if (lowerText.includes('yesterday') && lowerText.includes('go ')) {
      corrections.push({
        issue: 'Use passado com marcadores de tempo no passado.',
        guidance: "Depois de 'yesterday', prefira formas como 'went'.",
      });
    }

    return corrections;
  }

  private buildCoachResponse(
    input: CoachGenerationRequest,
    corrections: CoachCorrection[],
  ): string {
    const learnerText = input.learnerText;
    const focusHint = input.currentFocus
      ? ` Foco: ${input.currentFocus}.`
      : '';
    const goalHint = input.learningGoal ? ` Meta: ${input.learningGoal}.` : '';
    const ptBrHint =
      input.ptBrSupportLevel && ['high', 'medium'].includes(input.ptBrSupportLevel)
        ? ' Se quiser, explico rapidamente em PT-BR.'
        : '';

    if (corrections.length === 0) {
      return `Bom trabalho. Entendi: "${learnerText}". Vamos continuar a conversa.${focusHint}${goalHint}${ptBrHint}`.trim();
    }

    const firstGuidance = corrections[0]?.guidance ?? '';
    const tone =
      input.correctionIntensity === 'high'
        ? 'Correcao principal deste turno'
        : 'Ajuste principal deste turno';
    return `Bom esforço. ${tone}: ${firstGuidance} Agora tente mais uma frase com esse padrao.${focusHint}${goalHint}${ptBrHint}`.trim();
  }
}
