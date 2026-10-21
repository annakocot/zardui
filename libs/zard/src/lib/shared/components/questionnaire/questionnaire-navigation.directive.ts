import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import {
  buttonVariants,
  type ZardButtonShapeVariants,
  type ZardButtonSizeVariants,
  type ZardButtonTypeVariants,
} from '@/shared/components/button/button.variants';
import { mergeClasses } from '@/shared/utils/merge-classes';

import { ZardQuestionnaireComponent } from './questionnaire.component';
import {
  questionnaireNextVariants,
  questionnairePreviousVariants,
  questionnaireSkipVariants,
  questionnaireSubmitVariants,
} from './questionnaire.variants';

@Directive({
  selector: 'button[z-questionnaire-previous]',
  host: {
    type: 'button',
    'data-slot': 'questionnaire-previous',
    '[hidden]': '!questionnaire.canMoveBack()',
    '[disabled]': 'disabledState()',
    '[attr.aria-disabled]': 'disabledState() ? "true" : null',
    '[attr.aria-busy]': 'zLoading() ? "true" : null',
    '[attr.data-size]': 'zSize()',
    '[attr.data-variant]': 'zType()',
    '[class]': 'classes()',
    '(click)': 'moveBack()',
  },
  exportAs: 'zQuestionnairePrevious',
})
export class ZardQuestionnairePreviousDirective {
  protected readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly zType = input<ZardButtonTypeVariants>('outline');
  readonly zSize = input<ZardButtonSizeVariants>('default');
  readonly zShape = input<ZardButtonShapeVariants>('default');
  readonly zLoading = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');
  readonly disabledState = computed(() => this.zDisabled() || this.zLoading() || !this.questionnaire.canMoveBack());
  protected readonly classes = computed(() =>
    mergeClasses(
      buttonVariants({
        zType: this.zType(),
        zSize: this.zSize(),
        zShape: this.zShape(),
        zLoading: this.zLoading(),
        zDisabled: this.disabledState(),
      }),
      questionnairePreviousVariants(),
      this.class(),
    ),
  );

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
    '[hidden]': '!questionnaire.canSkip()',
    '[disabled]': 'disabledState()',
    '[attr.aria-disabled]': 'disabledState() ? "true" : null',
    '[attr.aria-busy]': 'zLoading() ? "true" : null',
    '[attr.data-size]': 'zSize()',
    '[attr.data-variant]': 'zType()',
    '[class]': 'classes()',
    '(click)': 'skip()',
  },
  exportAs: 'zQuestionnaireSkip',
})
export class ZardQuestionnaireSkipDirective {
  protected readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly zType = input<ZardButtonTypeVariants>('outline');
  readonly zSize = input<ZardButtonSizeVariants>('default');
  readonly zShape = input<ZardButtonShapeVariants>('default');
  readonly zLoading = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');
  readonly disabledState = computed(() => this.zDisabled() || this.zLoading() || !this.questionnaire.canSkip());
  protected readonly classes = computed(() =>
    mergeClasses(
      buttonVariants({
        zType: this.zType(),
        zSize: this.zSize(),
        zShape: this.zShape(),
        zLoading: this.zLoading(),
        zDisabled: this.disabledState(),
      }),
      questionnaireSkipVariants(),
      this.class(),
    ),
  );

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
    '[hidden]': '!questionnaire.canMoveNext()',
    '[disabled]': 'disabledState()',
    '[attr.aria-disabled]': 'disabledState() ? "true" : null',
    '[attr.aria-busy]': 'zLoading() ? "true" : null',
    '[attr.data-size]': 'zSize()',
    '[attr.data-variant]': 'zType()',
    '[class]': 'classes()',
    '(click)': 'moveNext()',
  },
  exportAs: 'zQuestionnaireNext',
})
export class ZardQuestionnaireNextDirective {
  protected readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly zType = input<ZardButtonTypeVariants>('default');
  readonly zSize = input<ZardButtonSizeVariants>('default');
  readonly zShape = input<ZardButtonShapeVariants>('default');
  readonly zLoading = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');
  readonly disabledState = computed(() => this.zDisabled() || this.zLoading() || !this.questionnaire.canMoveNext());
  protected readonly classes = computed(() =>
    mergeClasses(
      buttonVariants({
        zType: this.zType(),
        zSize: this.zSize(),
        zShape: this.zShape(),
        zLoading: this.zLoading(),
        zDisabled: this.disabledState(),
      }),
      questionnaireNextVariants(),
      this.class(),
    ),
  );

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
    '[hidden]': '!questionnaire.canSubmit()',
    '[disabled]': 'disabledState()',
    '[attr.aria-disabled]': 'disabledState() ? "true" : null',
    '[attr.aria-busy]': 'zLoading() ? "true" : null',
    '[attr.data-size]': 'zSize()',
    '[attr.data-variant]': 'zType()',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireSubmit',
})
export class ZardQuestionnaireSubmitDirective {
  protected readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly zDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly zType = input<ZardButtonTypeVariants>('default');
  readonly zSize = input<ZardButtonSizeVariants>('default');
  readonly zShape = input<ZardButtonShapeVariants>('default');
  readonly zLoading = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');
  readonly disabledState = computed(() => this.zDisabled() || this.zLoading() || !this.questionnaire.canSubmit());
  protected readonly classes = computed(() =>
    mergeClasses(
      buttonVariants({
        zType: this.zType(),
        zSize: this.zSize(),
        zShape: this.zShape(),
        zLoading: this.zLoading(),
        zDisabled: this.disabledState(),
      }),
      questionnaireSubmitVariants(),
      this.class(),
    ),
  );
}
