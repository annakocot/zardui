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
import { ZardQuestionnaireComponent } from './questionnaire.component';

@Component({
  selector: 'z-questionnaire-choice',
  template: `
    <label>
      <input
        [type]="item.zMultiple() ? 'checkbox' : 'radio'"
        [name]="item.zName()"
        [value]="zValue()"
        [disabled]="disabledState()"
        [attr.aria-keyshortcuts]="questionnaire.shortcutFor(input, item.zName())"
        #input
      />
      <ng-content />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-choice',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireChoice',
})
export class ZardQuestionnaireChoiceComponent {
  readonly item = inject(ZardQuestionnaireItemComponent);
  protected readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zValue = input.required<string>();
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');

  protected readonly disabledState = computed(() => this.zDisabled() || this.item.zDisabled());
  protected readonly classes = computed(() => mergeClasses(this.class()));
}
