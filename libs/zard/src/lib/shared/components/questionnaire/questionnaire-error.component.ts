import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { ZardQuestionnaireItemComponent } from './questionnaire-item.component';
import { questionnaireErrorVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire-error',
  template: `
    @if (item.isInvalid()) {
      <ng-content>Choose an answer to continue.</ng-content>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-error',
    role: 'alert',
    '[hidden]': '!item.isInvalid()',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireError',
})
export class ZardQuestionnaireErrorComponent {
  readonly item = inject(ZardQuestionnaireItemComponent);
  readonly class = input<ClassValue>('');
  protected readonly classes = computed(() => mergeClasses(questionnaireErrorVariants(), this.class()));
}
