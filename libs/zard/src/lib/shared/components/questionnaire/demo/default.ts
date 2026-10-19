import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ZardQuestionnaireComponent } from '../questionnaire.component';

@Component({
  selector: 'z-demo-questionnaire-default',
  imports: [ZardQuestionnaireComponent],
  template: `
    <z-questionnaire>Questionnaire</z-questionnaire>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardDemoQuestionnaireDefaultComponent {}
