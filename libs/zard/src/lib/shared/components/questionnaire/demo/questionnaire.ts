import { QUESTIONNAIRE_DEMO_DEFAULT } from '@generated/components/questionnaire/demo/default';
import { QUESTIONNAIRE_DEMO_EXPLICIT_SKIP } from '@generated/components/questionnaire/demo/explicit-skip';
import { QUESTIONNAIRE_DEMO_FREEFORM_ANSWER } from '@generated/components/questionnaire/demo/freeform-answer';
import { QUESTIONNAIRE_DEMO_MULTIPLE_SELECTION } from '@generated/components/questionnaire/demo/multiple-selection';
import { QUESTIONNAIRE_DEMO_SHORTCUTS } from '@generated/components/questionnaire/demo/shortcuts';
import { QUESTIONNAIRE_CLI_ADD } from '@generated/installation/cli/add-questionnaire';
import { QUESTIONNAIRE_MANUAL_CODE } from '@generated/installation/manual/questionnaire';
import { QUESTIONNAIRE_USAGE_CODE, QUESTIONNAIRE_USAGE_IMPORT } from '@generated/usage/questionnaire';

import { ZardDemoQuestionnaireDefaultComponent } from './default';
import { ZardDemoQuestionnaireExplicitSkipComponent } from './explicit-skip';
import { ZardDemoQuestionnaireFreeformAnswerComponent } from './freeform-answer';
import { ZardDemoQuestionnaireMultipleSelectionComponent } from './multiple-selection';
import { ZardDemoQuestionnaireShortcutsComponent } from './shortcuts';
import { QUESTIONNAIRE_API } from '../doc/api';

export const QUESTIONNAIRE = {
  componentName: 'questionnaire',
  componentType: 'questionnaire',
  description: 'A multi-step questionnaire with single-choice, multiple-choice, freeform, and skippable questions.',
  api: QUESTIONNAIRE_API,
  installData: {
    cliAdd: QUESTIONNAIRE_CLI_ADD,
    manualCode: QUESTIONNAIRE_MANUAL_CODE,
  },
  usage: { importBlock: QUESTIONNAIRE_USAGE_IMPORT, codeBlock: QUESTIONNAIRE_USAGE_CODE },
  examples: [
    {
      name: 'default',
      component: ZardDemoQuestionnaireDefaultComponent,
      codeData: QUESTIONNAIRE_DEMO_DEFAULT,
    },
    {
      name: 'multiple-selection',
      description: 'Use `multiple` for an item that accepts more than one fixed answer.',
      component: ZardDemoQuestionnaireMultipleSelectionComponent,
      codeData: QUESTIONNAIRE_DEMO_MULTIPLE_SELECTION,
    },
    {
      name: 'freeform-answer',
      description: 'Compose `QuestionnaireInput` with fixed choices when the user can provide another answer.',
      component: ZardDemoQuestionnaireFreeformAnswerComponent,
      codeData: QUESTIONNAIRE_DEMO_FREEFORM_ANSWER,
    },
    {
      name: 'explicit-skip',
      description: 'Add `QuestionnaireSkip` when an optional item may be intentionally left unanswered.',
      component: ZardDemoQuestionnaireExplicitSkipComponent,
      codeData: QUESTIONNAIRE_DEMO_EXPLICIT_SKIP,
    },
    {
      name: 'shortcuts',
      description: 'Assign a letter or number key to each answer with `shortcuts`.',
      component: ZardDemoQuestionnaireShortcutsComponent,
      codeData: QUESTIONNAIRE_DEMO_SHORTCUTS,
    },
  ],
};
