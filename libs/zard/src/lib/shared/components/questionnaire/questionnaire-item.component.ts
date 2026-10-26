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

import { ZardQuestionnaireComponent } from './questionnaire.component';
import { questionnaireItemVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire-item',
  template: `
    <fieldset
      [disabled]="zDisabled()"
      [attr.aria-invalid]="isInvalid() ? 'true' : null"
      [attr.data-active]="isActive() ? '' : null"
      [class]="classes()"
    >
      <ng-content />
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'contents',
    'data-slot': 'questionnaire-item',
    '[attr.data-questionnaire-name]': 'zName()',
    '[attr.aria-invalid]': 'isInvalid() ? "true" : null',
    '[attr.data-disabled]': 'zDisabled() ? "" : null',
    '[hidden]': '!isActive()',
  },
  exportAs: 'zQuestionnaireItem',
})
export class ZardQuestionnaireItemComponent {
  private readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zName = input.required<string>();
  readonly zRequired = input(false, { transform: booleanAttribute });
  readonly zMultiple = input(false, { transform: booleanAttribute });
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly zInvalid = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');

  readonly isActive = computed(() => this.questionnaire.zActive() === this.zName() && !this.zDisabled());
  readonly isInvalid = computed(() => this.zInvalid() || this.questionnaire.isInvalid(this.zName()));
  protected readonly classes = computed(() => mergeClasses(questionnaireItemVariants(), this.class()));
}
