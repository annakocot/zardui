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
    <form #form (submit)="handleSubmit($event)" (reset)="handleReset()">
      <ng-content />
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
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

    this.zActive.set(this.enabledItems()[this.activeIndex() + 1].name);
  }

  previous(): void {
    if (!this.canMoveBack()) {
      return;
    }

    this.zActive.set(this.enabledItems()[this.activeIndex() - 1].name);
  }

  skip(): void {
    const activeItem = this.enabledItems()[this.activeIndex()];
    if (!activeItem || activeItem.required) {
      return;
    }

    this.updateSet(this.skippedItems, activeItem.name, true);
    this.updateSet(this.invalidItems, activeItem.name, false);

    if (this.canMoveNext()) {
      this.zActive.set(this.enabledItems()[this.activeIndex() + 1].name);
    }
  }

  isInvalid(name: string): boolean {
    return this.invalidItems().has(name);
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
