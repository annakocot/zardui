import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { questionnaireErrorVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire-error',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-error',
    role: 'alert',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireError',
})
export class ZardQuestionnaireErrorComponent {
  readonly class = input<ClassValue>('');
  protected readonly classes = computed(() => mergeClasses(questionnaireErrorVariants(), this.class()));
}
