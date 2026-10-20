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

@Component({
  selector: 'z-questionnaire-item',
  template: `
    <fieldset [disabled]="zDisabled()" [attr.aria-invalid]="isInvalid() ? 'true' : null">
      <ng-content />
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-item',
    '[attr.data-questionnaire-name]': 'zName()',
    '[attr.aria-invalid]': 'isInvalid() ? "true" : null',
    '[attr.data-disabled]': 'zDisabled() ? "" : null',
    '[hidden]': '!isActive()',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireItem',
})
export class ZardQuestionnaireItemComponent {
  private readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zName = input.required<string>();
  readonly zRequired = input(false, { transform: booleanAttribute });
  readonly zMultiple = input(false, { transform: booleanAttribute });
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');

  readonly isActive = computed(() => this.questionnaire.zActive() === this.zName() && !this.zDisabled());
  readonly isInvalid = computed(() => this.questionnaire.isInvalid(this.zName()));
  protected readonly classes = computed(() => mergeClasses(this.class()));
}
