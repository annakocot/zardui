import { ChangeDetectionStrategy, Component, type Type } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  ZardQuestionnaireComponent,
  ZardQuestionnaireItemComponent,
  ZardQuestionnaireChoiceComponent,
  ZardQuestionnaireNextDirective,
  ZardQuestionnairePreviousDirective,
  ZardQuestionnaireProgressComponent,
  ZardQuestionnaireSkipDirective,
  ZardQuestionnaireSubmitDirective,
} from './questionnaire.imports';
import type {
  ZardQuestionnaireAnswers,
  ZardQuestionnaireItem,
  ZardQuestionnaireShortcutMode,
} from './questionnaire.types';

@Component({
  imports: [ZardQuestionnaireComponent, ZardQuestionnaireItemComponent],
  template: `
    <z-questionnaire [zItems]="items" [(zActive)]="active">
      @for (item of items; track item.name) {
        <z-questionnaire-item [zName]="item.name" [zDisabled]="item.disabled">
          {{ item.name }}
        </z-questionnaire-item>
      }
    </z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class InitialActiveItemHostComponent {
  readonly items: ZardQuestionnaireItem[] = [
    { name: 'disabled-first', disabled: true },
    { name: 'first-enabled' },
    { name: 'second-enabled' },
  ];

  active: string | undefined;
}

@Component({
  imports: [
    ZardQuestionnaireChoiceComponent,
    ZardQuestionnaireComponent,
    ZardQuestionnaireItemComponent,
    ZardQuestionnaireNextDirective,
  ],
  template: `
    <z-questionnaire [zItems]="items">
      @for (item of items; track item.name) {
        <z-questionnaire-item [attr.data-testid]="'uncontrolled-' + item.name" [zName]="item.name">
          <z-questionnaire-choice [zValue]="item.name + '-answer'">{{ item.name }}</z-questionnaire-choice>
        </z-questionnaire-item>
      }

      <button type="button" z-questionnaire-next>Next</button>
    </z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class UncontrolledQuestionnaireHostComponent {
  readonly items: ZardQuestionnaireItem[] = [{ name: 'first' }, { name: 'second' }];
}

@Component({
  imports: [ZardQuestionnaireComponent, ZardQuestionnaireItemComponent, ZardQuestionnaireSubmitDirective],
  template: `
    <z-questionnaire [zItems]="items" [(zActive)]="active" (zSubmit)="submitted = $event">
      <z-questionnaire-item zName="first">
        <input type="radio" name="first" value="saved-first" checked />
      </z-questionnaire-item>
      <z-questionnaire-item zName="second">
        <input type="radio" name="second" value="saved-second" checked />
      </z-questionnaire-item>

      <button type="submit" z-questionnaire-submit>Submit</button>
    </z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ResumedQuestionnaireHostComponent {
  readonly items: ZardQuestionnaireItem[] = [{ name: 'first' }, { name: 'second' }];
  active = 'second';
  submitted: ZardQuestionnaireAnswers | undefined;
}

@Component({
  imports: [
    ZardQuestionnaireChoiceComponent,
    ZardQuestionnaireComponent,
    ZardQuestionnaireItemComponent,
    ZardQuestionnaireNextDirective,
    ZardQuestionnaireProgressComponent,
    ZardQuestionnaireSubmitDirective,
  ],
  template: `
    <z-questionnaire [zItems]="items" [(zActive)]="active" zShortcuts="letters" (zSubmit)="submitted = $event">
      <z-questionnaire-progress />

      @for (item of items; track item.name) {
        <z-questionnaire-item
          [attr.data-testid]="item.name"
          [zName]="item.name"
          [zRequired]="item.required"
          [zDisabled]="item.disabled"
        >
          <z-questionnaire-choice [zValue]="item.name + '-answer'">{{ item.name }} answer</z-questionnaire-choice>
        </z-questionnaire-item>
      }

      <button type="button" z-questionnaire-next>Next</button>
      <button type="submit" z-questionnaire-submit>Submit</button>
    </z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class DisabledItemHostComponent {
  readonly items: ZardQuestionnaireItem[] = [
    { name: 'first', required: true },
    { name: 'disabled', required: true, disabled: true },
    { name: 'last', required: true },
  ];

  active: string | undefined;
  submitted: ZardQuestionnaireAnswers | undefined;
}

@Component({
  imports: [
    ZardQuestionnaireChoiceComponent,
    ZardQuestionnaireComponent,
    ZardQuestionnaireItemComponent,
    ZardQuestionnaireNextDirective,
    ZardQuestionnairePreviousDirective,
    ZardQuestionnaireProgressComponent,
    ZardQuestionnaireSkipDirective,
    ZardQuestionnaireSubmitDirective,
  ],
  template: `
    <z-questionnaire [zItems]="items" [(zActive)]="active" [zShortcuts]="shortcuts" (zSubmit)="submitted = $event">
      <z-questionnaire-progress />

      @for (item of items; track item.name) {
        <z-questionnaire-item
          [attr.data-testid]="'item-' + item.name"
          [zName]="item.name"
          [zRequired]="item.required"
          [zMultiple]="item.multiple"
          [zDisabled]="item.disabled"
        >
          <z-questionnaire-choice
            [attr.data-testid]="item.name + '-a'"
            [zValue]="item.name + '-a'"
            [zDisabled]="firstChoiceDisabled && item.name === 'first'"
          >
            {{ item.name }} A
          </z-questionnaire-choice>
          <z-questionnaire-choice [attr.data-testid]="item.name + '-b'" [zValue]="item.name + '-b'">
            {{ item.name }} B
          </z-questionnaire-choice>
          <input [attr.data-testid]="item.name + '-typing-input'" />
          <textarea [attr.data-testid]="item.name + '-typing-textarea'"></textarea>
          <select [attr.data-testid]="item.name + '-typing-select'">
            <option>Option</option>
          </select>
          <div contenteditable="true" [attr.data-testid]="item.name + '-typing-contenteditable'"></div>
        </z-questionnaire-item>
      }

      <button type="button" z-questionnaire-previous>Previous</button>
      <button type="button" z-questionnaire-skip>Skip</button>
      <button type="button" z-questionnaire-next>Next</button>
      <button type="submit" z-questionnaire-submit>Submit</button>
    </z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class QuestionnaireBehaviorHostComponent {
  items: ZardQuestionnaireItem[] = [];
  active: string | undefined;
  submitted: ZardQuestionnaireAnswers | undefined;
  shortcuts: ZardQuestionnaireShortcutMode = 'letters';
  firstChoiceDisabled = false;
}

async function createBehaviorFixture(
  items: ZardQuestionnaireItem[],
  active?: string,
): Promise<ComponentFixture<QuestionnaireBehaviorHostComponent>> {
  await TestBed.configureTestingModule({ imports: [QuestionnaireBehaviorHostComponent] }).compileComponents();
  const fixture = TestBed.createComponent(QuestionnaireBehaviorHostComponent);
  fixture.componentInstance.items = items;
  fixture.componentInstance.active = active;
  fixture.detectChanges();
  return fixture;
}

function getItem(fixture: ComponentFixture<QuestionnaireBehaviorHostComponent>, name: string): HTMLElement {
  return fixture.debugElement.query(By.css(`[data-testid="item-${name}"]`)).nativeElement as HTMLElement;
}

function getChoiceInput(
  fixture: ComponentFixture<QuestionnaireBehaviorHostComponent>,
  itemName: string,
  choice: 'a' | 'b',
): HTMLInputElement {
  const choiceElement = fixture.debugElement.query(By.css(`[data-testid="${itemName}-${choice}"]`))
    .nativeElement as HTMLElement;
  return choiceElement.querySelector('input') as HTMLInputElement;
}

function clickAction<T>(fixture: ComponentFixture<T>, directive: Type<unknown>): void {
  (fixture.debugElement.query(By.directive(directive)).nativeElement as HTMLButtonElement).click();
  fixture.detectChanges();
}

function getAction<T>(fixture: ComponentFixture<T>, directive: Type<unknown>): HTMLButtonElement {
  return fixture.debugElement.query(By.directive(directive)).nativeElement as HTMLButtonElement;
}

describe('ZardQuestionnaireComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should activate the first enabled item initially', async () => {
    await TestBed.configureTestingModule({ imports: [InitialActiveItemHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(InitialActiveItemHostComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.active).toBe('first-enabled');

    const items = fixture.debugElement.queryAll(By.directive(ZardQuestionnaireItemComponent));
    expect(items.map(item => (item.nativeElement as HTMLFieldSetElement).hidden)).toEqual([true, false, true]);
  });

  it('should exclude disabled items from progress, navigation, validation, shortcuts, and submission', async () => {
    await TestBed.configureTestingModule({ imports: [DisabledItemHostComponent] }).compileComponents();
    const fixture: ComponentFixture<DisabledItemHostComponent> = TestBed.createComponent(DisabledItemHostComponent);
    fixture.detectChanges();

    const progress = fixture.debugElement.query(By.directive(ZardQuestionnaireProgressComponent))
      .nativeElement as HTMLElement;
    const disabledItem = fixture.debugElement.query(By.css('[data-testid="disabled"]')).nativeElement as HTMLElement;

    expect(progress.getAttribute('aria-valuemax')).toBe('2');
    expect(progress.textContent).toContain('Question 1 of 2');
    expect(disabledItem.hidden).toBe(true);
    expect(disabledItem.querySelector('[aria-keyshortcuts]')).toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    fixture.detectChanges();
    fixture.debugElement.query(By.directive(ZardQuestionnaireNextDirective)).nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.active).toBe('last');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    fixture.detectChanges();
    fixture.debugElement.query(By.directive(ZardQuestionnaireSubmitDirective)).nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.submitted).toEqual({
      first: 'first-answer',
      last: 'last-answer',
    });
    expect(fixture.componentInstance.submitted).not.toHaveProperty('disabled');
  });

  it('should require required items to contain an answer', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'required', required: true },
      { name: 'next', required: true },
    ]);

    clickAction(fixture, ZardQuestionnaireNextDirective);

    expect(fixture.componentInstance.active).toBe('required');
    expect(getItem(fixture, 'required').getAttribute('aria-invalid')).toBe('true');

    getChoiceInput(fixture, 'required', 'a').click();
    fixture.detectChanges();
    clickAction(fixture, ZardQuestionnaireNextDirective);

    expect(fixture.componentInstance.active).toBe('next');
  });

  it('should only pass an unanswered optional item when it is skipped', async () => {
    const fixture = await createBehaviorFixture([{ name: 'optional' }, { name: 'next', required: true }]);

    clickAction(fixture, ZardQuestionnaireNextDirective);

    expect(fixture.componentInstance.active).toBe('optional');
    expect(getItem(fixture, 'optional').getAttribute('aria-invalid')).toBe('true');

    clickAction(fixture, ZardQuestionnaireSkipDirective);

    expect(fixture.componentInstance.active).toBe('next');
  });

  it('should preserve answers when navigating to the previous item', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'first', required: true },
      { name: 'second', required: true },
    ]);

    getChoiceInput(fixture, 'first', 'b').click();
    fixture.detectChanges();
    clickAction(fixture, ZardQuestionnaireNextDirective);
    clickAction(fixture, ZardQuestionnairePreviousDirective);

    expect(fixture.componentInstance.active).toBe('first');
    expect(getChoiceInput(fixture, 'first', 'b').checked).toBe(true);
  });

  it('should validate only the current item when moving next', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'first', required: true },
      { name: 'second', required: true },
      { name: 'third', required: true },
    ]);

    clickAction(fixture, ZardQuestionnaireNextDirective);

    expect(getItem(fixture, 'first').getAttribute('aria-invalid')).toBe('true');
    expect(getItem(fixture, 'second').getAttribute('aria-invalid')).toBeNull();
    expect(getItem(fixture, 'third').getAttribute('aria-invalid')).toBeNull();
  });

  it('should validate all enabled items on submit and open the first invalid item', async () => {
    const fixture = await createBehaviorFixture(
      [
        { name: 'first', required: true },
        { name: 'disabled', required: true, disabled: true },
        { name: 'second', required: true },
        { name: 'third', required: true },
      ],
      'third',
    );

    clickAction(fixture, ZardQuestionnaireSubmitDirective);

    expect(fixture.componentInstance.active).toBe('first');
    expect(getItem(fixture, 'first').getAttribute('aria-invalid')).toBe('true');
    expect(getItem(fixture, 'second').getAttribute('aria-invalid')).toBe('true');
    expect(getItem(fixture, 'third').getAttribute('aria-invalid')).toBe('true');
    expect(getItem(fixture, 'disabled').getAttribute('aria-invalid')).toBeNull();
    expect(fixture.componentInstance.submitted).toBeUndefined();
  });

  it('should serialize a single answer as a string', async () => {
    const fixture = await createBehaviorFixture([{ name: 'single', required: true }]);

    getChoiceInput(fixture, 'single', 'a').click();
    fixture.detectChanges();
    clickAction(fixture, ZardQuestionnaireSubmitDirective);

    expect(fixture.componentInstance.submitted).toEqual({ single: 'single-a' });
    expect(typeof fixture.componentInstance.submitted?.['single']).toBe('string');
  });

  it('should serialize multiple answers as an array', async () => {
    const fixture = await createBehaviorFixture([{ name: 'multiple', required: true, multiple: true }]);

    getChoiceInput(fixture, 'multiple', 'a').click();
    getChoiceInput(fixture, 'multiple', 'b').click();
    fixture.detectChanges();
    clickAction(fixture, ZardQuestionnaireSubmitDirective);

    expect(fixture.componentInstance.submitted).toEqual({ multiple: ['multiple-a', 'multiple-b'] });
    expect(Array.isArray(fixture.componentInstance.submitted?.['multiple'])).toBe(true);
  });

  it('should omit skipped answers from the submitted record', async () => {
    const fixture = await createBehaviorFixture([{ name: 'optional' }, { name: 'required', required: true }]);

    clickAction(fixture, ZardQuestionnaireSkipDirective);
    getChoiceInput(fixture, 'required', 'a').click();
    fixture.detectChanges();
    clickAction(fixture, ZardQuestionnaireSubmitDirective);

    expect(fixture.componentInstance.submitted).toEqual({ required: 'required-a' });
    expect(fixture.componentInstance.submitted).not.toHaveProperty('optional');
  });

  it('should select an answer with a shortcut without advancing', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'first', required: true },
      { name: 'second', required: true },
    ]);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    fixture.detectChanges();

    expect(getChoiceInput(fixture, 'first', 'a').checked).toBe(true);
    expect(fixture.componentInstance.active).toBe('first');
  });

  it('should not activate answer shortcuts while typing in an input', async () => {
    const fixture = await createBehaviorFixture([{ name: 'first', required: true }]);
    const typingInput = fixture.debugElement.query(By.css('[data-testid="first-typing-input"]'))
      .nativeElement as HTMLInputElement;

    typingInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    fixture.detectChanges();

    expect(getChoiceInput(fixture, 'first', 'a').checked).toBe(false);
    expect(getChoiceInput(fixture, 'first', 'b').checked).toBe(false);
    expect(fixture.componentInstance.active).toBe('first');
  });

  it('should allow an answered optional item to advance without being skipped', async () => {
    const fixture = await createBehaviorFixture([{ name: 'optional' }, { name: 'next', required: true }]);

    getChoiceInput(fixture, 'optional', 'a').click();
    fixture.detectChanges();
    clickAction(fixture, ZardQuestionnaireNextDirective);

    expect(fixture.componentInstance.active).toBe('next');
  });

  it('should not allow a required item to be skipped', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'required', required: true },
      { name: 'next', required: true },
    ]);
    const skip = getAction(fixture, ZardQuestionnaireSkipDirective);

    expect(skip.disabled).toBe(true);

    skip.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.active).toBe('required');
  });

  it('should submit an answer added after an item was previously skipped', async () => {
    const fixture = await createBehaviorFixture([{ name: 'optional' }, { name: 'required', required: true }]);

    clickAction(fixture, ZardQuestionnaireSkipDirective);
    clickAction(fixture, ZardQuestionnairePreviousDirective);
    getChoiceInput(fixture, 'optional', 'a').click();
    fixture.detectChanges();
    clickAction(fixture, ZardQuestionnaireNextDirective);
    getChoiceInput(fixture, 'required', 'a').click();
    fixture.detectChanges();
    clickAction(fixture, ZardQuestionnaireSubmitDirective);

    expect(fixture.componentInstance.submitted).toEqual({
      optional: 'optional-a',
      required: 'required-a',
    });
  });

  it('should select an answer with a number shortcut without advancing', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'first', required: true },
      { name: 'second', required: true },
    ]);
    fixture.componentInstance.shortcuts = 'numbers';
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '2', bubbles: true }));
    fixture.detectChanges();

    expect(getChoiceInput(fixture, 'first', 'b').checked).toBe(true);
    expect(fixture.componentInstance.active).toBe('first');
  });

  it('should ignore shortcuts with modifier keys', async () => {
    const fixture = await createBehaviorFixture([{ name: 'first', required: true }]);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
    fixture.detectChanges();

    expect(getChoiceInput(fixture, 'first', 'a').checked).toBe(false);
  });

  it('should not select a disabled choice with a shortcut', async () => {
    const fixture = await createBehaviorFixture([{ name: 'first', required: true }]);
    fixture.componentInstance.firstChoiceDisabled = true;
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    fixture.detectChanges();

    expect(getChoiceInput(fixture, 'first', 'a').checked).toBe(false);
  });

  it.each(['textarea', 'select', 'contenteditable'] as const)(
    'should not activate answer shortcuts while typing in a %s',
    async control => {
      const fixture = await createBehaviorFixture([{ name: 'first', required: true }]);
      const typingControl = fixture.debugElement.query(By.css(`[data-testid="first-typing-${control}"]`))
        .nativeElement as HTMLElement;

      typingControl.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      fixture.detectChanges();

      expect(getChoiceInput(fixture, 'first', 'a').checked).toBe(false);
      expect(getChoiceInput(fixture, 'first', 'b').checked).toBe(false);
    },
  );

  it('should announce the assigned shortcuts on active choices', async () => {
    const fixture = await createBehaviorFixture([{ name: 'first', required: true }]);

    expect(getChoiceInput(fixture, 'first', 'a').getAttribute('aria-keyshortcuts')).toBe('a');
    expect(getChoiceInput(fixture, 'first', 'b').getAttribute('aria-keyshortcuts')).toBe('b');
  });

  it('should clear an item error after the answer is corrected and Next is retried', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'first', required: true },
      { name: 'second', required: true },
    ]);

    clickAction(fixture, ZardQuestionnaireNextDirective);
    expect(getItem(fixture, 'first').getAttribute('aria-invalid')).toBe('true');

    getChoiceInput(fixture, 'first', 'a').click();
    fixture.detectChanges();
    clickAction(fixture, ZardQuestionnaireNextDirective);

    expect(getItem(fixture, 'first').getAttribute('aria-invalid')).toBeNull();
  });

  it('should clear an item error immediately when the answer is corrected', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'first', required: true },
      { name: 'second', required: true },
    ]);

    clickAction(fixture, ZardQuestionnaireNextDirective);
    expect(getItem(fixture, 'first').getAttribute('aria-invalid')).toBe('true');

    getChoiceInput(fixture, 'first', 'a').click();
    fixture.detectChanges();

    expect(getItem(fixture, 'first').getAttribute('aria-invalid')).toBeNull();
  });

  it('should focus the first answer in the new item after moving next', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'first', required: true },
      { name: 'second', required: true },
    ]);
    getChoiceInput(fixture, 'first', 'a').click();
    fixture.detectChanges();

    clickAction(fixture, ZardQuestionnaireNextDirective);
    await fixture.whenStable();

    expect(document.activeElement === getChoiceInput(fixture, 'second', 'a')).toBe(true);
  });

  it('should focus the first answer in the new item after moving previous', async () => {
    const fixture = await createBehaviorFixture(
      [
        { name: 'first', required: true },
        { name: 'second', required: true },
      ],
      'second',
    );

    clickAction(fixture, ZardQuestionnairePreviousDirective);
    await fixture.whenStable();

    expect(document.activeElement === getChoiceInput(fixture, 'first', 'a')).toBe(true);
  });

  it('should focus the first answer in the new item after skipping', async () => {
    const fixture = await createBehaviorFixture([{ name: 'optional' }, { name: 'required', required: true }]);

    clickAction(fixture, ZardQuestionnaireSkipDirective);
    await fixture.whenStable();

    expect(document.activeElement === getChoiceInput(fixture, 'required', 'a')).toBe(true);
  });

  it('should focus the first answer in the first invalid item on submit', async () => {
    const fixture = await createBehaviorFixture(
      [
        { name: 'first', required: true },
        { name: 'second', required: true },
      ],
      'second',
    );

    clickAction(fixture, ZardQuestionnaireSubmitDirective);
    await fixture.whenStable();

    expect(fixture.componentInstance.active).toBe('first');
    expect(document.activeElement === getChoiceInput(fixture, 'first', 'a')).toBe(true);
  });

  it.each([
    ['empty', []],
    ['all-disabled', [{ name: 'disabled', disabled: true }]],
  ] as const)('should disable every navigation action for an %s item list', async (_case, items) => {
    const fixture = await createBehaviorFixture([...items]);
    const progress = fixture.debugElement.query(By.directive(ZardQuestionnaireProgressComponent))
      .nativeElement as HTMLElement;

    expect(fixture.componentInstance.active).toBeUndefined();
    expect(progress.textContent).toContain('Question 0 of 0');
    expect(progress.getAttribute('aria-valuemax')).toBe('0');
    expect(progress.getAttribute('aria-valuenow')).toBe('0');
    expect(getAction(fixture, ZardQuestionnairePreviousDirective).disabled).toBe(true);
    expect(getAction(fixture, ZardQuestionnaireSkipDirective).disabled).toBe(true);
    expect(getAction(fixture, ZardQuestionnaireNextDirective).disabled).toBe(true);
    expect(getAction(fixture, ZardQuestionnaireSubmitDirective).disabled).toBe(true);
  });

  it('should clear validation state and restore the first enabled item on form reset', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'first', required: true },
      { name: 'second', required: true },
    ]);

    clickAction(fixture, ZardQuestionnaireNextDirective);
    expect(getItem(fixture, 'first').getAttribute('aria-invalid')).toBe('true');

    const form = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
    form.reset();
    fixture.detectChanges();

    expect(fixture.componentInstance.active).toBe('first');
    expect(getItem(fixture, 'first').getAttribute('aria-invalid')).toBeNull();
  });

  it('should clear skipped state on form reset', async () => {
    const fixture = await createBehaviorFixture([{ name: 'optional' }, { name: 'required', required: true }]);

    clickAction(fixture, ZardQuestionnaireSkipDirective);
    const form = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
    form.reset();
    fixture.detectChanges();

    expect(fixture.componentInstance.active).toBe('optional');
    expect(getAction(fixture, ZardQuestionnaireSkipDirective).disabled).toBe(false);
  });

  it('should retain a valid controlled active item', async () => {
    const fixture = await createBehaviorFixture(
      [
        { name: 'first', required: true },
        { name: 'second', required: true },
      ],
      'second',
    );

    expect(fixture.componentInstance.active).toBe('second');
    expect(getItem(fixture, 'first').hidden).toBe(true);
    expect(getItem(fixture, 'second').hidden).toBe(false);
  });

  it('should manage the active item without a zActive binding', async () => {
    await TestBed.configureTestingModule({ imports: [UncontrolledQuestionnaireHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(UncontrolledQuestionnaireHostComponent);
    fixture.detectChanges();
    const questionnaire = fixture.debugElement.query(By.directive(ZardQuestionnaireComponent))
      .componentInstance as ZardQuestionnaireComponent;
    const firstItem = fixture.debugElement.query(By.css('[data-testid="uncontrolled-first"]'))
      .nativeElement as HTMLElement;
    const secondItem = fixture.debugElement.query(By.css('[data-testid="uncontrolled-second"]'))
      .nativeElement as HTMLElement;

    expect(questionnaire.zActive()).toBe('first');
    expect(firstItem.hidden).toBe(false);
    expect(secondItem.hidden).toBe(true);

    (firstItem.querySelector('input') as HTMLInputElement).click();
    fixture.detectChanges();
    clickAction(fixture, ZardQuestionnaireNextDirective);

    expect(questionnaire.zActive()).toBe('second');
    expect(firstItem.hidden).toBe(true);
    expect(secondItem.hidden).toBe(false);
  });

  it('should resume from native controls initialized with saved answers', async () => {
    await TestBed.configureTestingModule({ imports: [ResumedQuestionnaireHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ResumedQuestionnaireHostComponent);
    fixture.detectChanges();
    const checkedInputs = fixture.debugElement.queryAll(By.css('input:checked'));

    expect(checkedInputs.map(input => (input.nativeElement as HTMLInputElement).value)).toEqual([
      'saved-first',
      'saved-second',
    ]);

    clickAction(fixture, ZardQuestionnaireSubmitDirective);

    expect(fixture.componentInstance.submitted).toEqual({
      first: 'saved-first',
      second: 'saved-second',
    });
  });

  it('should recover when a dynamic item update disables the active item', async () => {
    const fixture = await createBehaviorFixture([
      { name: 'first', required: true },
      { name: 'second', required: true },
    ]);
    fixture.componentInstance.items = [
      { name: 'first', required: true, disabled: true },
      { name: 'second', required: true },
    ];

    fixture.detectChanges();

    expect(fixture.componentInstance.active).toBe('second');
  });

  it('should render each questionnaire item with fieldset semantics', async () => {
    const fixture = await createBehaviorFixture([{ name: 'first', required: true }]);

    expect(getItem(fixture, 'first').querySelector('fieldset')).not.toBeNull();
  });
});
