---
title: Questionnaire
description: A multi-step questionnaire with single-choice, multiple-choice, freeform, and skippable questions.
---

# Questionnaire

A multi-step questionnaire with single-choice, multiple-choice, freeform, and skippable questions.

## Installation

### CLI

```bash
npx zard-cli@latest add questionnaire
```

### Manual

```angular-ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import type {
  ZardQuestionnaireAnswers,
  ZardQuestionnaireItem,
  ZardQuestionnaireShortcutMode,
} from './questionnaire.types';
import { questionnaireVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire',
  template: `
    <form
      #form
      data-slot="questionnaire"
      [class]="classes()"
      (input)="handleAnswerChange($event)"
      (submit)="handleSubmit($event)"
      (reset)="handleReset()"
    >
      <ng-content />
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'block w-full',
    '[attr.data-shortcuts]': 'zShortcuts() === "none" ? null : zShortcuts()',
    '(document:keydown)': 'handleShortcut($event)',
  },
  exportAs: 'zQuestionnaire',
})
export class ZardQuestionnaireComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly form = viewChild.required<ElementRef<HTMLFormElement>>('form');
  private readonly invalidItems = signal<ReadonlySet<string>>(new Set());
  private readonly skippedItems = signal<ReadonlySet<string>>(new Set());

  readonly class = input<ClassValue>('');
  readonly zItems = input<readonly ZardQuestionnaireItem[]>([]);
  readonly zActive = model<string | undefined>(undefined);
  readonly zShortcuts = input<ZardQuestionnaireShortcutMode>('none');
  readonly zSubmit = output<ZardQuestionnaireAnswers>();

  readonly enabledItems = computed(() => this.zItems().filter(item => !item.disabled));
  readonly activeIndex = computed(() => {
    const index = this.enabledItems().findIndex(item => item.name === this.zActive());
    return index >= 0 ? index : 0;
  });

  readonly canMoveNext = computed(() => this.activeIndex() < this.enabledItems().length - 1);
  readonly canMoveBack = computed(() => this.activeIndex() > 0);
  readonly canSkip = computed(() => {
    const activeItem = this.enabledItems()[this.activeIndex()];
    return Boolean(activeItem && !activeItem.required && !this.skippedItems().has(activeItem.name));
  });

  readonly canSubmit = computed(
    () => this.enabledItems().length > 0 && this.activeIndex() === this.enabledItems().length - 1,
  );

  protected readonly classes = computed(() => mergeClasses(questionnaireVariants(), this.class()));

  constructor() {
    effect(() => {
      const enabledItems = this.enabledItems();
      const active = this.zActive();

      if (!enabledItems.some(item => item.name === active)) {
        this.zActive.set(enabledItems[0]?.name);
      }
    });
  }

  next(): void {
    if (!this.canMoveNext()) {
      return;
    }

    const activeItem = this.enabledItems()[this.activeIndex()];
    if (!activeItem || !this.validateItem(activeItem)) {
      this.focusFirstAnswer(activeItem?.name);
      return;
    }

    const nextItem = this.enabledItems()[this.activeIndex() + 1];
    this.zActive.set(nextItem.name);
    this.focusFirstAnswer(nextItem.name);
  }

  previous(): void {
    if (!this.canMoveBack()) {
      return;
    }

    const previousItem = this.enabledItems()[this.activeIndex() - 1];
    this.zActive.set(previousItem.name);
    this.focusFirstAnswer(previousItem.name);
  }

  skip(): void {
    const activeItem = this.enabledItems()[this.activeIndex()];
    if (!activeItem || activeItem.required) {
      return;
    }

    this.updateSet(this.skippedItems, activeItem.name, true);
    this.updateSet(this.invalidItems, activeItem.name, false);

    if (this.canMoveNext()) {
      const nextItem = this.enabledItems()[this.activeIndex() + 1];
      this.zActive.set(nextItem.name);
      this.focusFirstAnswer(nextItem.name);
    }
  }

  isInvalid(name: string): boolean {
    return this.invalidItems().has(name);
  }

  shortcutFor(input: HTMLInputElement, itemName: string): string | null {
    const mode = this.zShortcuts();
    if (mode === 'none' || itemName !== this.zActive() || input.disabled) {
      return null;
    }

    const item = input.closest<HTMLElement>('[data-slot="questionnaire-item"]');
    const choices = Array.from(
      item?.querySelectorAll<HTMLInputElement>('[data-slot="questionnaire-choice"] input:not(:disabled)') ?? [],
    );
    const index = choices.indexOf(input);

    if (index < 0) {
      return null;
    }

    if (mode === 'letters') {
      return index < 26 ? String.fromCharCode(97 + index) : null;
    }

    return index < 9 ? String(index + 1) : null;
  }

  handleAnswerChange(event: Event): void {
    const control = event.target;
    if (
      !(control instanceof HTMLInputElement) &&
      !(control instanceof HTMLTextAreaElement) &&
      !(control instanceof HTMLSelectElement)
    ) {
      return;
    }

    const { name } = control;
    if (!name || !this.enabledItems().some(item => item.name === name) || !this.hasAnswer(name)) {
      return;
    }

    this.updateSet(this.skippedItems, name, false);
    this.updateSet(this.invalidItems, name, false);
  }

  handleSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const invalidItems = this.enabledItems().filter(item => !this.isItemValid(item));
    this.invalidItems.set(new Set(invalidItems.map(item => item.name)));

    if (invalidItems.length > 0) {
      this.zActive.set(invalidItems[0].name);
      this.focusFirstAnswer(invalidItems[0].name);
      return;
    }

    const formData = new FormData(this.form().nativeElement);
    const answers: ZardQuestionnaireAnswers = {};

    for (const item of this.enabledItems()) {
      if (this.skippedItems().has(item.name)) {
        continue;
      }

      const values = formData.getAll(item.name).map(String);
      if (values.length === 0) {
        continue;
      }

      answers[item.name] = item.multiple ? values : values[0];
    }

    this.zSubmit.emit(answers);
  }

  handleReset(): void {
    this.invalidItems.set(new Set());
    this.skippedItems.set(new Set());
    this.zActive.set(this.enabledItems()[0]?.name);
  }

  protected handleShortcut(event: KeyboardEvent): void {
    if (this.zShortcuts() === 'none' || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const { target } = event;
    if (target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable)) {
      return;
    }

    const shortcutIndex = this.shortcutIndex(event.key);
    if (shortcutIndex < 0) {
      return;
    }

    const activeItem = this.elementRef.nativeElement.querySelector<HTMLElement>(
      '[data-slot="questionnaire-item"]:not([hidden])',
    );
    const choices = activeItem?.querySelectorAll<HTMLInputElement>(
      '[data-slot="questionnaire-choice"] input:not(:disabled)',
    );
    const choice = choices?.item(shortcutIndex);

    if (choice) {
      event.preventDefault();
      choice.click();
    }
  }

  private validateItem(item: ZardQuestionnaireItem): boolean {
    const valid = this.isItemValid(item);
    this.updateSet(this.invalidItems, item.name, !valid);
    return valid;
  }

  private isItemValid(item: ZardQuestionnaireItem): boolean {
    return this.hasAnswer(item.name) || (!item.required && this.skippedItems().has(item.name));
  }

  private hasAnswer(name: string): boolean {
    return new FormData(this.form().nativeElement).getAll(name).some(value => String(value).trim().length > 0);
  }

  private focusFirstAnswer(name?: string): void {
    if (!name) {
      return;
    }

    queueMicrotask(() => {
      this.elementRef.nativeElement
        .querySelector<HTMLElement>(`[data-questionnaire-name="${CSS.escape(name)}"] input:not(:disabled)`)
        ?.focus();
    });
  }

  private shortcutIndex(key: string): number {
    if (this.zShortcuts() === 'letters') {
      const normalizedKey = key.toLowerCase();
      return normalizedKey.length === 1 ? normalizedKey.charCodeAt(0) - 97 : -1;
    }

    return /^[1-9]$/.test(key) ? Number(key) - 1 : -1;
  }

  private updateSet(state: typeof this.invalidItems, name: string, present: boolean): void {
    state.update(current => {
      const next = new Set(current);
      if (present) {
        next.add(name);
      } else {
        next.delete(name);
      }
      return next;
    });
  }
}
```

```angular-ts
import { cva, type VariantProps } from 'class-variance-authority';

export const questionnaireVariants = cva('flex w-full min-w-0 flex-col gap-4 mx-auto max-w-md');

export const questionnaireProgressVariants = cva(
  'min-h-lh w-fit min-w-[14ch] text-xs font-medium text-muted-foreground tabular-nums',
);

export const questionnaireTitleVariants = cva(
  'text-base/snug font-medium text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-4',
);

export const questionnaireDescriptionVariants = cva('text-sm text-pretty text-muted-foreground');

export const questionnaireItemVariants = cva(
  'flex w-full min-w-0 flex-col gap-4 border-0 p-0 outline-none [&[hidden]]:hidden',
);

export const questionnaireChoicesVariants = cva('group/questionnaire-choices grid min-w-0 gap-2');

export const questionnaireChoiceVariants = cva(
  'group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg border border-input bg-transparent px-3 py-2.5 text-start text-sm transition-colors outline-none select-none hover:bg-muted/50 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 data-invalid:border-destructive dark:bg-input/20 has-[input:checked]:border-primary/40 has-[input:checked]:bg-muted dark:has-[input:checked]:bg-muted data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
);

export const questionnaireInputVariants = cva(
  'h-8 min-h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:min-h-0 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground',
);

export const questionnaireChoiceLabelVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5 leading-snug');

export const questionnaireChoiceShortcutVariants = cva(
  'pointer-events-none ms-auto inline-flex size-5 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-md border border-input bg-background font-mono text-[0.625rem] leading-none font-medium text-muted-foreground group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5',
);

export const questionnaireInputWrapperVariants = cva('group/questionnaire-input relative block w-full min-w-0');

export const questionnaireErrorVariants = cva('mt-2 text-sm text-destructive');

export const questionnaireActionsVariants = cva(
  'grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:min-h-8',
);

export const questionnairePreviousVariants = cva(
  'col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0 [&[hidden]]:hidden',
);

export const questionnaireSkipVariants = cva(
  'col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0 [&[hidden]]:hidden',
);

export const questionnaireNextVariants = cva(
  'col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0 [&[hidden]]:hidden',
);

export const questionnaireSubmitVariants = questionnaireNextVariants;

export type ZardQuestionnaireVariants = VariantProps<typeof questionnaireVariants>;
```

```angular-ts
export * from './questionnaire.component';
export * from './questionnaire.variants';
```

```angular-ts
import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { questionnaireActionsVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire-actions',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-actions',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireActions',
})
export class ZardQuestionnaireActionsComponent {
  readonly class = input<ClassValue>('');
  protected readonly classes = computed(() => mergeClasses(questionnaireActionsVariants(), this.class()));
}
```

```angular-ts
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
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('');

  protected readonly disabledState = computed(() => this.zDisabled() || this.item.zDisabled());
  protected readonly classes = computed(() => mergeClasses(questionnaireChoiceVariants(), this.class()));
  protected readonly labelClasses = questionnaireChoiceLabelVariants();
  protected readonly shortcutClasses = questionnaireChoiceShortcutVariants();
}
```

```angular-ts
import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { questionnaireChoicesVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire-choices',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-choices',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireChoices',
})
export class ZardQuestionnaireChoicesComponent {
  readonly class = input<ClassValue>('');
  protected readonly classes = computed(() => mergeClasses(questionnaireChoicesVariants(), this.class()));
}
```

```angular-ts
import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { questionnaireDescriptionVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire-description',
  template: `
    <p>
      <ng-content />
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-description',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireDescription',
})
export class ZardQuestionnaireDescriptionComponent {
  readonly class = input<ClassValue>('');
  protected readonly classes = computed(() => mergeClasses(questionnaireDescriptionVariants(), this.class()));
}
```

```angular-ts
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
```

```angular-ts
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
```

```angular-ts
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
    <fieldset [disabled]="zDisabled()" [attr.aria-invalid]="isInvalid() ? 'true' : null" [class]="classes()">
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
  readonly class = input<ClassValue>('');

  readonly isActive = computed(() => this.questionnaire.zActive() === this.zName() && !this.zDisabled());
  readonly isInvalid = computed(() => this.questionnaire.isInvalid(this.zName()));
  protected readonly classes = computed(() => mergeClasses(questionnaireItemVariants(), this.class()));
}
```

```angular-ts
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
```

```angular-ts
import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { ZardQuestionnaireComponent } from './questionnaire.component';
import { questionnaireProgressVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire-progress',
  template: `
    Question {{ current() }} of {{ total() }}
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'progressbar',
    'aria-valuemin': '1',
    '[attr.aria-valuemax]': 'total()',
    '[attr.aria-valuenow]': 'current()',
    '[attr.aria-valuetext]': '"Question " + current() + " of " + total()',
    'data-slot': 'questionnaire-progress',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireProgress',
})
export class ZardQuestionnaireProgressComponent {
  private readonly questionnaire = inject(ZardQuestionnaireComponent);

  readonly class = input<ClassValue>('');
  readonly current = computed(() =>
    this.questionnaire.enabledItems().length === 0 ? 0 : this.questionnaire.activeIndex() + 1,
  );

  readonly total = computed(() => this.questionnaire.enabledItems().length);

  protected readonly classes = computed(() => mergeClasses(questionnaireProgressVariants(), this.class()));
}
```

```angular-ts
import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { questionnaireTitleVariants } from './questionnaire.variants';

@Component({
  selector: 'z-questionnaire-title',
  template: `
    <legend>
      <ng-content />
    </legend>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-title',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireTitle',
})
export class ZardQuestionnaireTitleComponent {
  readonly class = input<ClassValue>('');
  protected readonly classes = computed(() => mergeClasses(questionnaireTitleVariants(), this.class()));
}
```

```angular-ts
import { ZardQuestionnaireActionsComponent } from './questionnaire-actions.component';
import { ZardQuestionnaireChoiceComponent } from './questionnaire-choice.component';
import { ZardQuestionnaireChoicesComponent } from './questionnaire-choices.component';
import { ZardQuestionnaireDescriptionComponent } from './questionnaire-description.component';
import { ZardQuestionnaireErrorComponent } from './questionnaire-error.component';
import { ZardQuestionnaireInputComponent } from './questionnaire-input.component';
import { ZardQuestionnaireItemComponent } from './questionnaire-item.component';
import {
  ZardQuestionnaireNextDirective,
  ZardQuestionnairePreviousDirective,
  ZardQuestionnaireSkipDirective,
  ZardQuestionnaireSubmitDirective,
} from './questionnaire-navigation.directive';
import { ZardQuestionnaireProgressComponent } from './questionnaire-progress.component';
import { ZardQuestionnaireTitleComponent } from './questionnaire-title.component';
import { ZardQuestionnaireComponent } from './questionnaire.component';

export const ZardQuestionnaireImports = [
  ZardQuestionnaireComponent,
  ZardQuestionnaireChoiceComponent,
  ZardQuestionnaireChoicesComponent,
  ZardQuestionnaireItemComponent,
  ZardQuestionnaireProgressComponent,
  ZardQuestionnaireActionsComponent,
  ZardQuestionnaireTitleComponent,
  ZardQuestionnaireDescriptionComponent,
  ZardQuestionnaireInputComponent,
  ZardQuestionnaireErrorComponent,
  ZardQuestionnairePreviousDirective,
  ZardQuestionnaireSkipDirective,
  ZardQuestionnaireNextDirective,
  ZardQuestionnaireSubmitDirective,
] as const;

export {
  ZardQuestionnaireComponent,
  ZardQuestionnaireChoiceComponent,
  ZardQuestionnaireChoicesComponent,
  ZardQuestionnaireItemComponent,
  ZardQuestionnaireProgressComponent,
  ZardQuestionnaireActionsComponent,
  ZardQuestionnaireTitleComponent,
  ZardQuestionnaireDescriptionComponent,
  ZardQuestionnaireInputComponent,
  ZardQuestionnaireErrorComponent,
  ZardQuestionnairePreviousDirective,
  ZardQuestionnaireSkipDirective,
  ZardQuestionnaireNextDirective,
  ZardQuestionnaireSubmitDirective,
};
```

```angular-ts
export type ZardQuestionnaireAnswer = string | string[];
export type ZardQuestionnaireAnswers = Record<string, ZardQuestionnaireAnswer>;
export type ZardQuestionnaireShortcutMode = 'none' | 'letters' | 'numbers';

export interface ZardQuestionnaireChoice {
  value: string;
  label?: string;
  disabled?: boolean;
}

export interface ZardQuestionnaireItem {
  name: string;
  title?: string;
  description?: string;
  choices?: readonly ZardQuestionnaireChoice[];
  required?: boolean;
  multiple?: boolean;
  disabled?: boolean;
}
```

## Usage

```angular-ts
import { ZardQuestionnaireImports } from '@/shared/components/questionnaire/questionnaire.imports';
```

```angular-html
<z-questionnaire [zItems]="items">
  <!-- questionnaire items -->
</z-questionnaire>
```

## Examples

### Default

```angular-ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ZardSonnerService } from '@/shared/components/sonner/sonner.service';

import { ZardQuestionnaireImports } from '../questionnaire.imports';
import type { ZardQuestionnaireAnswer, ZardQuestionnaireAnswers, ZardQuestionnaireItem } from '../questionnaire.types';

const DIRECTION_LABELS: Record<string, string> = {
  'tool-call-timeline': 'tool call timeline',
  'approval-checkpoints': 'approval checkpoints',
  'sub-agent-handoffs': 'sub-agent handoffs',
};

const UPDATE_LABELS: Record<string, string> = {
  progress: 'progress',
  decisions: 'decisions',
  risks: 'risks',
  'next-step': 'next step',
};

const TIMING_LABELS: Record<string, string> = {
  now: 'now',
  'next-cycle': 'next development cycle',
  backlog: 'backlog',
};

@Component({
  selector: 'z-demo-questionnaire-default',
  imports: [ZardQuestionnaireImports],
  template: `
    <z-questionnaire [zItems]="items" zShortcuts="letters" (zSubmit)="save($event)">
      <z-questionnaire-progress />

      <z-questionnaire-item zName="goal" zRequired>
        <z-questionnaire-title>What should the agent build next?</z-questionnaire-title>
        <z-questionnaire-description>Choose a direction or describe another task.</z-questionnaire-description>
        <z-questionnaire-choices>
          <z-questionnaire-choice zValue="tool-call-timeline">
            <span>Tool call timeline</span>
            <span data-slot="questionnaire-choice-description" class="text-muted-foreground">
              Show what the agent ran and what came back.
            </span>
          </z-questionnaire-choice>
          <z-questionnaire-choice zValue="approval-checkpoints">
            <span>Approval checkpoints</span>
            <span data-slot="questionnaire-choice-description" class="text-muted-foreground">
              Ask before sensitive or destructive actions.
            </span>
          </z-questionnaire-choice>
          <z-questionnaire-choice zValue="sub-agent-handoffs">
            <span>Sub-agent handoffs</span>
            <span data-slot="questionnaire-choice-description" class="text-muted-foreground">
              Make delegated work and results easier to follow.
            </span>
          </z-questionnaire-choice>
          <z-questionnaire-input placeholder="Describe another feature..." aria-label="Next task" />
        </z-questionnaire-choices>
        <z-questionnaire-error />
      </z-questionnaire-item>

      <z-questionnaire-item zName="updates" zMultiple>
        <z-questionnaire-title>What should every progress update include?</z-questionnaire-title>
        <z-questionnaire-description>Select all that apply, or skip this question.</z-questionnaire-description>
        <z-questionnaire-choices>
          <z-questionnaire-choice zValue="progress">Progress made</z-questionnaire-choice>
          <z-questionnaire-choice zValue="decisions">Decisions taken</z-questionnaire-choice>
          <z-questionnaire-choice zValue="risks">Risks or blockers</z-questionnaire-choice>
          <z-questionnaire-choice zValue="next-step">Next step</z-questionnaire-choice>
        </z-questionnaire-choices>
        <z-questionnaire-error />
      </z-questionnaire-item>

      <z-questionnaire-item zName="start" zRequired>
        <z-questionnaire-title>When should work begin?</z-questionnaire-title>
        <z-questionnaire-description>Choose one option.</z-questionnaire-description>
        <z-questionnaire-choices>
          <z-questionnaire-choice zValue="now">Start now</z-questionnaire-choice>
          <z-questionnaire-choice zValue="next-cycle">Next development cycle</z-questionnaire-choice>
          <z-questionnaire-choice zValue="backlog">Add it to the backlog</z-questionnaire-choice>
        </z-questionnaire-choices>
        <z-questionnaire-error />
      </z-questionnaire-item>

      <z-questionnaire-actions>
        <button type="button" z-questionnaire-previous>Back</button>
        <button type="button" z-questionnaire-skip>Skip</button>
        <button type="button" z-questionnaire-next>Next</button>
        <button type="submit" z-questionnaire-submit>Finish</button>
      </z-questionnaire-actions>
    </z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class ZardDemoQuestionnaireDefaultComponent {
  private readonly sonner = inject(ZardSonnerService);

  readonly items: ZardQuestionnaireItem[] = [
    { name: 'goal', required: true },
    { name: 'updates', multiple: true },
    { name: 'start', required: true },
  ];

  save(answers: ZardQuestionnaireAnswers): void {
    this.sonner.show('Agent plan saved', {
      description: [
        `Direction: ${this.formatDirection(answers['goal'])}`,
        `Progress signals: ${this.formatUpdates(answers['updates'])}`,
        `Timing: ${this.formatTiming(answers['start'])}`,
      ].join(' · '),
    });
  }

  private formatDirection(answer: ZardQuestionnaireAnswer | undefined): string {
    const value = this.singleValue(answer);
    return value ? (DIRECTION_LABELS[value] ?? value) : 'None';
  }

  private formatUpdates(answer: ZardQuestionnaireAnswer | undefined): string {
    const values = Array.isArray(answer) ? answer : answer ? [answer] : [];
    return values.length ? values.map(value => UPDATE_LABELS[value] ?? value).join(', ') : 'None';
  }

  private formatTiming(answer: ZardQuestionnaireAnswer | undefined): string {
    const value = this.singleValue(answer);
    return value ? (TIMING_LABELS[value] ?? value) : 'None';
  }

  private singleValue(answer: ZardQuestionnaireAnswer | undefined): string | undefined {
    return Array.isArray(answer) ? answer[0] : answer;
  }
}
```

### Multiple Selection

Use `multiple` for an item that accepts more than one fixed answer.

```angular-ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ZardSonnerService } from '../../sonner';
import { ZardQuestionnaireImports } from '../questionnaire.imports';

@Component({
  selector: 'z-demo-questionnaire-default',
  imports: [ZardQuestionnaireImports],
  template: `
    <z-questionnaire zShortcuts="letters">
      <z-questionnaire-item zName="stack" zRequired zMultiple>
        <z-questionnaire-title>What context should the agent inspect?</z-questionnaire-title>
        <z-questionnaire-choices>
          <z-questionnaire-choice zValue="source-files">Relevant source files</z-questionnaire-choice>
          <z-questionnaire-choice zValue="tests">Existing tests</z-questionnaire-choice>
          <z-questionnaire-choice zValue="architecture">Architecture documentation</z-questionnaire-choice>
          <z-questionnaire-choice zValue="commit-history">Recent commit history</z-questionnaire-choice>
        </z-questionnaire-choices>
        <z-questionnaire-error />
      </z-questionnaire-item>

      <z-questionnaire-actions>
        <button type="submit" z-questionnaire-submit>Finish</button>
      </z-questionnaire-actions>
    </z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class ZardDemoQuestionnaireMultipleSelectionComponent {
  private readonly sonner = inject(ZardSonnerService);
}
```

## API Reference

### z-questionnaire

A multi-step questionnaire with single-choice, multiple-choice, freeform, and skippable questions.

| Prop | Description | Type | Default |
| --- | --- | --- | --- |
| `[class]` | Custom CSS classes | `ClassValue` | `''` |

---

[Open in browser](https://zardui.com/docs/components/questionnaire)
