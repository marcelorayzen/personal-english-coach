import { Injectable } from '@nestjs/common';
import { Mistake, MistakeCategory } from '@prisma/client';

export interface ReviewQueueDecision {
  itemType: string;
  prompt: string;
  priority: number;
  category: MistakeCategory;
  recurrenceCount: number;
}

@Injectable()
export class ReviewQueuePolicy {
  decide(mistakes: Mistake[]): ReviewQueueDecision | null {
    if (mistakes.length === 0) {
      return null;
    }

    const counts = new Map<MistakeCategory, number>();
    for (const mistake of mistakes) {
      counts.set(mistake.category, (counts.get(mistake.category) ?? 0) + 1);
    }

    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!top) {
      return null;
    }

    const [category, recurrenceCount] = top;
    if (recurrenceCount < 3) {
      return null;
    }

    const lastCategoryOccurrence = mistakes.find(
      (mistake) => mistake.category === category,
    );
    const isRecent =
      !!lastCategoryOccurrence &&
      Date.now() - lastCategoryOccurrence.createdAt.getTime() < 24 * 60 * 60 * 1000;

    const priority = Math.min(
      100,
      40 + recurrenceCount * 10 + (isRecent ? 10 : 0),
    );

    return {
      category,
      recurrenceCount,
      itemType: `mistake:${category}`,
      prompt: this.buildPrompt(category),
      priority,
    };
  }

  private buildPrompt(category: MistakeCategory): string {
    switch (category) {
      case MistakeCategory.grammar:
        return 'Do 5 short sentences focused on correct tense and agreement.';
      case MistakeCategory.vocabulary:
        return 'Practice 5 replacements with more precise vocabulary.';
      case MistakeCategory.pronunciation:
        return 'Read 5 target words slowly, then at natural speed.';
      case MistakeCategory.fluency:
        return 'Give a 60-second answer with fewer pauses and restarts.';
      case MistakeCategory.syntax:
        return 'Rebuild 5 sentences with a cleaner word order.';
      case MistakeCategory.word_choice:
        return 'Rewrite 5 phrases choosing more natural word combinations.';
      case MistakeCategory.reading_accuracy:
        return 'Read a short paragraph and self-correct misread words.';
      default:
        return 'Practice a short focused review for recurring mistakes.';
    }
  }
}
