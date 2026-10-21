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

export const questionnaireVariants = cva('flex w-full min-w-0 flex-col gap-4');

export const questionnaireProgressVariants = cva(
  'min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium text-muted-foreground tabular-nums',
);

export const questionnaireTitleVariants = cva(
  'text-base leading-snug font-medium text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-4',
);

export const questionnaireDescriptionVariants = cva('text-sm text-pretty text-muted-foreground');

export const questionnaireChoicesVariants = cva('group/questionnaire-choices grid min-w-0 gap-2');

export const questionnaireChoiceVariants = cva(
  'group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg border border-input bg-transparent px-3 py-2.5 text-start text-sm transition-colors outline-none select-none hover:bg-muted/50 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 data-invalid:border-destructive dark:bg-input/20 has-[input:checked]:border-primary/40 has-[input:checked]:bg-muted dark:has-[input:checked]:bg-muted data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
);

export const questionnaireItemVariants = cva(
  'flex min-w-0 flex-col gap-4 border-0 p-0 outline-none [&[hidden]]:hidden',
);

export type ZardQuestionnaireVariants = VariantProps<typeof questionnaireVariants>;
```

```angular-ts
export * from './questionnaire.component';
export * from './questionnaire.variants';
```

```angular-ts
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'z-questionnaire-actions',
  template: `
    <div>
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-actions',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireActions',
})
export class ZardQuestionnaireActionsComponent {
  classes() {
    return 'z-questionnaire-actions';
  }
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
import { questionnaireChoiceVariants } from './questionnaire.variants';

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
      <ng-content />
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
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'z-questionnaire-error',
  template: `
    <div>
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-error',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireError',
})
export class ZardQuestionnaireErrorComponent {
  classes(): string {
    return 'questionnaire-error';
  }
}
```

```angular-ts
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'z-questionnaire-input',
  template: `
    <input />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'questionnaire-input',
    '[class]': 'classes()',
  },
  exportAs: 'zQuestionnaireInput',
})
export class ZardQuestionnaireInputComponent {
  classes() {
    return 'z-questionnaire-input';
  }
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
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ZardQuestionnaireImports } from '../questionnaire.imports';
import type { ZardQuestionnaireAnswers, ZardQuestionnaireItem } from '../questionnaire.types';

@Component({
  selector: 'z-demo-questionnaire-default',
  imports: [ZardQuestionnaireImports],
  template: `
    <z-questionnaire [zItems]="items" zShortcuts="letters" (zSubmit)="save($event)">
      <z-questionnaire-progress />

      @for (q of items; track q.name) {
        <z-questionnaire-item [zName]="q.name" [zRequired]="q.required">
          <z-questionnaire-title>{{ q.title }}</z-questionnaire-title>
          <z-questionnaire-description>{{ q.description }}</z-questionnaire-description>

          <z-questionnaire-choices>
            @for (choice of q.choices ?? []; track choice.value) {
              <z-questionnaire-choice [zValue]="choice.value" [zDisabled]="choice.disabled">
                {{ choice.label ?? choice.value }}
              </z-questionnaire-choice>
            }
          </z-questionnaire-choices>

          <z-questionnaire-error />
        </z-questionnaire-item>
      }

      <z-questionnaire-actions>
        <button type="button" z-questionnaire-previous>Back</button>
        <button type="button" z-questionnaire-skip>Skip</button>
        <button type="button" z-questionnaire-next>Next</button>
        <button type="submit" z-questionnaire-submit>Finish</button>
      </z-questionnaire-actions>
    </z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardDemoQuestionnaireDefaultComponent {
  items: ZardQuestionnaireItem[] = [
    {
      name: 'question 1',
      required: true,
      multiple: false,
      disabled: false,
      title: 'What should the agent build next?',
      description: 'Choose a direction or describe another task.',
      choices: [
        {
          value: 'Tool call timeline',
          label: 'Show what the agent ran and what came back.',
        },
        {
          value: 'Approval checkpoints',
          label: 'Ask before sensitive or destructive actions.',
        },
        {
          value: 'Sub-agent handoffs',
          label: 'Make delegated work and results easier to follow.',
        },
      ],
    },
  ];

  save(answers: ZardQuestionnaireAnswers): void {
    console.log(answers);
  }
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
