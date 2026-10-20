import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ZardQuestionnaireNextDirective } from './questionnaire-navigation.directive';
import { ZardQuestionnaireComponent } from './questionnaire.component';
import type { ZardQuestionnaireItem } from './questionnaire.types';

@Component({
  imports: [ZardQuestionnaireComponent, ZardQuestionnaireNextDirective],
  template: `
    <z-questionnaire [zItems]="items" [(zActive)]="active">
      <input type="radio" name="first" value="answered" checked />
      <button z-questionnaire-next [disabled]="nextDisabled">Next</button>
    </z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class NextDirectiveHostComponent {
  readonly items: ZardQuestionnaireItem[] = [{ name: 'first', required: true }, { name: 'second' }];
  active = 'first';
  nextDisabled = false;
}

describe('ZardQuestionnaireNextDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NextDirectiveHostComponent] }).compileComponents();
  });

  it('moves to the next enabled item and disables itself on the last item', () => {
    const fixture = TestBed.createComponent(NextDirectiveHostComponent);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.directive(ZardQuestionnaireNextDirective))
      .nativeElement as HTMLButtonElement;

    expect(button.type).toBe('button');
    expect(button.dataset['slot']).toBe('questionnaire-next');
    expect(button.disabled).toBe(false);

    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.active).toBe('second');
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('preserves a consumer disabled state and does not navigate', () => {
    const fixture = TestBed.createComponent(NextDirectiveHostComponent);
    fixture.componentInstance.nextDisabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.directive(ZardQuestionnaireNextDirective))
      .nativeElement as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
    expect(fixture.componentInstance.active).toBe('first');
  });
});
