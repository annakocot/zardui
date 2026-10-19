import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { questionnaireVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire',
  template: `
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaire',
})
export class ZardQuestionnaireComponent {
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() => mergeClasses(questionnaireVariants(), this.class()));
}
