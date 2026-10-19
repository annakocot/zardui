import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { ZardQuestionnaireComponent } from './questionnaire.component';

describe('QuestionnaireComponent', () => {
  let component: ZardQuestionnaireComponent;
  let fixture: ComponentFixture<ZardQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZardQuestionnaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ZardQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
