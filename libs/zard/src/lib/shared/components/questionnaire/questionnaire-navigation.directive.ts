import { Directive } from '@angular/core';

@Directive({
  selector: 'button[z-questionnaire-previous]',
})
export class ZardQuestionnairePreviousDirective {}

@Directive({
  selector: 'button[z-questionnaire-skip]',
})
export class ZardQuestionnaireSkipDirective {}

@Directive({
  selector: 'button[z-questionnaire-next]',
})
export class ZardQuestionnaireNextDirective {}

@Directive({
  selector: 'button[z-questionnaire-submit]',
})
export class ZardQuestionnaireSubmitDirective {}
