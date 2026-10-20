import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';

import { ZardQuestionnaireComponent } from './questionnaire.component';

@Directive({
  selector: 'button[z-questionnaire-previous]',
  host: {
    type: 'button',
    'data-slot': 'questionnaire-previous',
    '[disabled]': 'disabledState()',
    '[attr.aria-disabled]': 'disabledState() ? "true" : null',
    '(click)': 'moveBack()',
  },
  exportAs: 'zQuestionnairePrevious',
})
export class ZardQuestionnairePreviousDirective {
  private readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly disabledState = computed(() => this.zDisabled() || !this.questionnaire.canMoveBack());

  protected moveBack(): void {
    if (!this.disabledState()) {
      this.questionnaire.previous();
    }
  }
}

@Directive({
  selector: 'button[z-questionnaire-skip]',
  host: {
    type: 'button',
    'data-slot': 'questionnaire-skip',
    '[disabled]': 'disabledState()',
    '[attr.aria-disabled]': 'disabledState() ? "true" : null',
    '(click)': 'skip()',
  },
  exportAs: 'zQuestionnaireSkip',
})
export class ZardQuestionnaireSkipDirective {
  private readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly disabledState = computed(() => this.zDisabled() || !this.questionnaire.canSkip());

  protected skip(): void {
    if (!this.disabledState()) {
      this.questionnaire.skip();
    }
  }
}

@Directive({
  selector: 'button[z-questionnaire-next]',
  host: {
    type: 'button',
    'data-slot': 'questionnaire-next',
    '[disabled]': 'disabledState()',
    '[attr.aria-disabled]': 'disabledState() ? "true" : null',
    '(click)': 'moveNext()',
  },
  exportAs: 'zQuestionnaireNext',
})
export class ZardQuestionnaireNextDirective {
  private readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly disabledState = computed(() => this.zDisabled() || !this.questionnaire.canMoveNext());

  protected moveNext(): void {
    if (!this.disabledState()) {
      this.questionnaire.next();
    }
  }
}

@Directive({
  selector: 'button[z-questionnaire-submit]',
  host: {
    type: 'submit',
    'data-slot': 'questionnaire-submit',
    '[disabled]': 'disabledState()',
    '[attr.aria-disabled]': 'disabledState() ? "true" : null',
  },
  exportAs: 'zQuestionnaireSubmit',
})
export class ZardQuestionnaireSubmitDirective {
  private readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly disabledState = computed(() => this.zDisabled() || !this.questionnaire.canSubmit());
}
