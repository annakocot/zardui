import { QUESTIONNAIRE_DEMO_CONDITIONAL_ITEMS } from '@generated/components/questionnaire/demo/conditional-items';
import { QUESTIONNAIRE_DEMO_CONTROLLED } from '@generated/components/questionnaire/demo/controlled';
import { QUESTIONNAIRE_DEMO_CUSTOM_PROGRESS } from '@generated/components/questionnaire/demo/custom-progress';
import { QUESTIONNAIRE_DEMO_CUSTOM_VALIDATION } from '@generated/components/questionnaire/demo/custom-validation';
import { QUESTIONNAIRE_DEMO_DEFAULT } from '@generated/components/questionnaire/demo/default';
import { QUESTIONNAIRE_DEMO_EXPLICIT_SKIP } from '@generated/components/questionnaire/demo/explicit-skip';
import { QUESTIONNAIRE_DEMO_FREEFORM_ANSWER } from '@generated/components/questionnaire/demo/freeform-answer';
import { QUESTIONNAIRE_DEMO_MULTIPLE_SELECTION } from '@generated/components/questionnaire/demo/multiple-selection';
import { QUESTIONNAIRE_DEMO_NAVIGATION_STATE } from '@generated/components/questionnaire/demo/navigation-state';
import { QUESTIONNAIRE_DEMO_RESUME } from '@generated/components/questionnaire/demo/resume';
import { QUESTIONNAIRE_DEMO_SHORTCUTS } from '@generated/components/questionnaire/demo/shortcuts';
import { QUESTIONNAIRE_CLI_ADD } from '@generated/installation/cli/add-questionnaire';
import { QUESTIONNAIRE_MANUAL_CODE } from '@generated/installation/manual/questionnaire';
import { QUESTIONNAIRE_USAGE_CODE, QUESTIONNAIRE_USAGE_IMPORT } from '@generated/usage/questionnaire';

import { ZardDemoQuestionnaireConditionalItemsComponent } from './conditional-items';
import { ZardDemoQuestionnaireControlledComponent } from './controlled';
import { ZardDemoQuestionnaireCustomProgressComponent } from './custom-progress';
import { ZardDemoQuestionnaireCustomValidationComponent } from './custom-validation';
import { ZardDemoQuestionnaireDefaultComponent } from './default';
import { ZardDemoQuestionnaireExplicitSkipComponent } from './explicit-skip';
import { ZardDemoQuestionnaireFreeformAnswerComponent } from './freeform-answer';
import { ZardDemoQuestionnaireMultipleSelectionComponent } from './multiple-selection';
import { ZardDemoQuestionnaireNavigationStateComponent } from './navigation-state';
import { ZardDemoQuestionnaireResumeComponent } from './resume';
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
    {
      name: 'custom-validation',
      description:
        'Combine controlled navigation with an external schema such as Zod to return to an invalid item and present its error.',
      component: ZardDemoQuestionnaireCustomValidationComponent,
      codeData: QUESTIONNAIRE_DEMO_CUSTOM_VALIDATION,
    },
    {
      name: 'controlled',
      description: 'Control the active item from host state, such as returning to an invalid step.',
      component: ZardDemoQuestionnaireControlledComponent,
      codeData: QUESTIONNAIRE_DEMO_CONTROLLED,
    },

    {
      name: 'resume',
      description: 'Restore a saved active item and default answers, then reset changes back to that saved state.',
      component: ZardDemoQuestionnaireResumeComponent,
      codeData: QUESTIONNAIRE_DEMO_RESUME,
    },
    {
      name: 'conditional-items',
      description: "Disable items that do not apply to the user's earlier answers.",
      component: ZardDemoQuestionnaireConditionalItemsComponent,
      codeData: QUESTIONNAIRE_DEMO_CONDITIONAL_ITEMS,
    },
    {
      name: 'navigation-state',
      description: 'Use the active item status to disable navigation until the current question has an answer.',
      component: ZardDemoQuestionnaireNavigationStateComponent,
      codeData: QUESTIONNAIRE_DEMO_NAVIGATION_STATE,
    },
    {
      name: 'custom-progress',
      description: 'Replace the default progress label with a custom step indicator.',
      component: ZardDemoQuestionnaireCustomProgressComponent,
      codeData: QUESTIONNAIRE_DEMO_CUSTOM_PROGRESS,
    },
  ],
};
