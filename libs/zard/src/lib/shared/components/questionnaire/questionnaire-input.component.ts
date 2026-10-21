import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { ZardQuestionnaireItemComponent } from './questionnaire-item.component';
import { questionnaireInputVariants, questionnaireInputWrapperVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire-input',
  template: `
    <input
      data-slot="questionnaire-input"
      [type]="type()"
      [name]="item.zName()"
      [placeholder]="placeholder()"
      [disabled]="disabledState()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-invalid]="item.isInvalid() ? 'true' : null"
      [class]="inputClasses()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-input-wrapper',
    '[class]': 'wrapperClasses',
  },
  exportAs: 'zQuestionnaireInput',
})
export class ZardQuestionnaireInputComponent {
  readonly item = inject(ZardQuestionnaireItemComponent);

  readonly type = input('text');
  readonly placeholder = input('');
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');

  protected readonly disabledState = computed(() => this.zDisabled() || this.item.zDisabled());
  protected readonly inputClasses = computed(() => mergeClasses(questionnaireInputVariants(), this.class()));
  protected readonly wrapperClasses = questionnaireInputWrapperVariants();
}
