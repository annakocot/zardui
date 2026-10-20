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
import type { ZardQuestionnaireAnswers, ZardQuestionnaireItem } from './questionnaire.types';

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
      <button type="button" z-questionnaire-submit>Submit</button>
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
    ZardQuestionnaireSkipDirective,
    ZardQuestionnaireSubmitDirective,
  ],
  template: `
    <z-questionnaire [zItems]="items" [(zActive)]="active" zShortcuts="letters" (zSubmit)="submitted = $event">
      @for (item of items; track item.name) {
        <z-questionnaire-item
          [attr.data-testid]="'item-' + item.name"
          [zName]="item.name"
          [zRequired]="item.required"
          [zMultiple]="item.multiple"
          [zDisabled]="item.disabled"
        >
          <z-questionnaire-choice [attr.data-testid]="item.name + '-a'" [zValue]="item.name + '-a'">
            {{ item.name }} A
          </z-questionnaire-choice>
          <z-questionnaire-choice [attr.data-testid]="item.name + '-b'" [zValue]="item.name + '-b'">
            {{ item.name }} B
          </z-questionnaire-choice>
          <input [attr.data-testid]="item.name + '-typing-input'" />
        </z-questionnaire-item>
      }

      <button type="button" z-questionnaire-previous>Previous</button>
      <button type="button" z-questionnaire-skip>Skip</button>
      <button type="button" z-questionnaire-next>Next</button>
      <button type="button" z-questionnaire-submit>Submit</button>
    </z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class QuestionnaireBehaviorHostComponent {
  items: ZardQuestionnaireItem[] = [];
  active: string | undefined;
  submitted: ZardQuestionnaireAnswers | undefined;
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
});
