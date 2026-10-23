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
import {
  questionnaireChoiceLabelVariants,
  questionnaireChoiceShortcutVariants,
  questionnaireChoiceVariants,
} from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire-choice',
  template: `
    <label class="contents">
      <input
        [type]="item.zMultiple() ? 'checkbox' : 'radio'"
        [name]="item.zName()"
        [value]="zValue()"
        [attr.checked]="checked() ? '' : null"
        [disabled]="disabledState()"
        [attr.aria-keyshortcuts]="questionnaire.shortcutFor(input, item.zName())"
        #input
      />
      <span data-slot="questionnaire-choice-label" [class]="labelClasses">
        <ng-content />
      </span>
      @if (questionnaire.shortcutFor(input, item.zName()); as shortcut) {
        <span data-slot="questionnaire-choice-shortcut" aria-hidden="true" [class]="shortcutClasses">
          {{ shortcut.toUpperCase() }}
        </span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-choice',
    '[attr.data-disabled]': 'disabledState() ? "" : null',
    '[attr.data-invalid]': 'item.isInvalid() ? "" : null',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireChoice',
})
export class ZardQuestionnaireChoiceComponent {
  readonly item = inject(ZardQuestionnaireItemComponent);
  protected readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zValue = input.required<string>();
  readonly checked = input(false, { transform: booleanAttribute });
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');

  protected readonly disabledState = computed(() => this.zDisabled() || this.item.zDisabled());
  protected readonly classes = computed(() => mergeClasses(questionnaireChoiceVariants(), this.class()));
  protected readonly labelClasses = questionnaireChoiceLabelVariants();
  protected readonly shortcutClasses = questionnaireChoiceShortcutVariants();
}
